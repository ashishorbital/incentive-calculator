import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';
import { validateNoOverlap } from '../services/slabValidation.js';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('incentive_slabs')
      .select('*')
      .order('min_units');
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.use(authenticate, adminOnly);

router.post(
  '/',
  body('min_units').isInt({ min: 0 }),
  body('max_units').optional({ nullable: true }).isInt({ min: 1 }),
  body('incentive_per_car').isFloat({ gt: 0 }),
  body('effective_date').isISO8601().toDate(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { min_units, max_units, incentive_per_car, effective_date } = req.body;
    if (max_units != null && max_units <= min_units) {
      throw new AppError('Maximum units must be greater than minimum', 400);
    }

    const overlap = await validateNoOverlap({
      min_units,
      max_units: max_units ?? null,
      effective_date,
    });
    if (!overlap.valid) throw new AppError(overlap.message, 400);

    const { data, error } = await supabase
      .from('incentive_slabs')
      .insert({
        min_units,
        max_units: max_units ?? null,
        incentive_per_car,
        effective_date,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'CREATE', 'incentive_slabs', data.id);

    const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
    const notifyUsers = await supabase.from('users').select('id').eq('role', 'sales_officer');
    const all = [...(admins || []), ...(notifyUsers || [])];
    for (const u of all) {
      await supabase.from('notifications').insert({
        user_id: u.id,
        title: 'Incentive slab updated',
        message: `New slab: ${min_units}-${max_units ?? '∞'} @ ₹${incentive_per_car}/car`,
      });
    }

    res.status(201).json(data);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await supabase
      .from('incentive_slabs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (existing.error) throw new AppError('Slab not found', 404);

    const min_units = req.body.min_units ?? existing.data.min_units;
    const max_units = req.body.max_units !== undefined ? req.body.max_units : existing.data.max_units;
    const effective_date = req.body.effective_date ?? existing.data.effective_date;

    if (max_units != null && max_units <= min_units) {
      throw new AppError('Maximum units must be greater than minimum', 400);
    }

    const overlap = await validateNoOverlap({
      min_units,
      max_units,
      effective_date,
      excludeId: req.params.id,
    });
    if (!overlap.valid) throw new AppError(overlap.message, 400);

    const { data, error } = await supabase
      .from('incentive_slabs')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'UPDATE', 'incentive_slabs', req.params.id);
    res.json(data);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase
      .from('incentive_slabs')
      .update({ status: 'inactive' })
      .eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'DELETE', 'incentive_slabs', req.params.id);
    res.status(204).send();
  })
);

export default router;
