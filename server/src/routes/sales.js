import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly, officerOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';
import {
  findApplicableSlab,
  calculateIncentive,
  persistCalculation,
  previewCalculation,
} from '../services/incentive.js';

const router = Router();
router.use(authenticate);

function normalizeMonth(input) {
  const d = new Date(input);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let q = supabase.from('sales_records').select('*, car_models(model_name, variant)');

    if (req.user.role === 'sales_officer') {
      q = q.eq('officer_id', req.user.id);
    } else if (req.query.officer_id) {
      q = q.eq('officer_id', req.query.officer_id);
    }

    if (req.query.month) q = q.eq('month', normalizeMonth(req.query.month));
    if (req.query.status) q = q.eq('status', req.query.status);

    const { data, error } = await q.order('month', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.post(
  '/',
  officerOnly,
  body('month').notEmpty(),
  body('model_id').isUUID(),
  body('units_sold').isInt({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const month = normalizeMonth(req.body.month);
    const { data, error } = await supabase
      .from('sales_records')
      .upsert(
        {
          officer_id: req.user.id,
          month,
          model_id: req.body.model_id,
          units_sold: req.body.units_sold,
          status: 'draft',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'officer_id,month,model_id' }
      )
      .select('*, car_models(model_name, variant)')
      .single();

    if (error) throw new AppError(error.message, 500);
    res.status(201).json(data);
  })
);

router.patch(
  '/:id',
  officerOnly,
  body('units_sold').optional().isInt({ min: 1 }),
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabase
      .from('sales_records')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.officer_id !== req.user.id) {
      throw new AppError('Record not found', 404);
    }
    if (existing.status === 'submitted') {
      throw new AppError('Cannot edit submitted sales', 400);
    }

    const { data, error } = await supabase
      .from('sales_records')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*, car_models(model_name, variant)')
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.delete(
  '/:id',
  officerOnly,
  asyncHandler(async (req, res) => {
    const { data: existing } = await supabase
      .from('sales_records')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existing || existing.officer_id !== req.user.id) {
      throw new AppError('Record not found', 404);
    }
    if (existing.status === 'submitted') throw new AppError('Cannot delete submitted sales', 400);

    await supabase.from('sales_records').delete().eq('id', req.params.id);
    res.status(204).send();
  })
);

router.post(
  '/submit',
  officerOnly,
  body('month').notEmpty(),
  asyncHandler(async (req, res) => {
    const month = normalizeMonth(req.body.month);
    const officerId = req.user.id;

    const { data: drafts, error: draftErr } = await supabase
      .from('sales_records')
      .select('units_sold')
      .eq('officer_id', officerId)
      .eq('month', month)
      .eq('status', 'draft');

    if (draftErr) throw new AppError(draftErr.message, 500);
    if (!drafts?.length) throw new AppError('No draft sales to submit', 400);

    await supabase
      .from('sales_records')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('officer_id', officerId)
      .eq('month', month)
      .eq('status', 'draft');

    const { data: all } = await supabase
      .from('sales_records')
      .select('units_sold')
      .eq('officer_id', officerId)
      .eq('month', month)
      .eq('status', 'submitted');

    const totalUnits = (all || []).reduce((s, r) => s + r.units_sold, 0);
    const slab = await findApplicableSlab(totalUnits, month);
    const calc = calculateIncentive(totalUnits, slab);
    const saved = await persistCalculation(officerId, month, calc);

    await logAudit(officerId, 'SUBMIT_SALES', 'sales_records', null, { month, totalUnits });

    const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
    for (const admin of admins || []) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: 'Sales submitted',
        message: `${req.user.name} submitted ${totalUnits} cars for ${month}`,
      });
    }

    await supabase.from('notifications').insert({
      user_id: officerId,
      title: 'Incentive calculated',
      message: `Your incentive for ${month}: ₹${calc.total_incentive.toLocaleString('en-IN')}`,
    });

    res.json({ calculation: saved, breakdown: calc });
  })
);

router.get(
  '/preview',
  officerOnly,
  asyncHandler(async (req, res) => {
    if (!req.query.month) throw new AppError('month query required', 400);
    const month = normalizeMonth(req.query.month);
    const preview = await previewCalculation(req.user.id, month);
    res.json(preview);
  })
);

router.get(
  '/admin-summary',
  adminOnly,
  asyncHandler(async (req, res) => {
    const month = req.query.month ? normalizeMonth(req.query.month) : null;
    let q = supabase
      .from('sales_records')
      .select('officer_id, units_sold, month, users(name)')
      .eq('status', 'submitted');
    if (month) q = q.eq('month', month);
    const { data, error } = await q;
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
