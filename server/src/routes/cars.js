import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// ✅ PUBLIC/ACTIVE endpoint for officers (no admin check)
router.get(
  '/active',
  authenticate,
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('car_models')
      .select('*')
      .eq('status', 'active')
      .order('model_name');

    if (error) throw new AppError(error.message, 500);
    res.json(data || []);
  })
);

// ADMIN ONLY routes below
router.use(authenticate, adminOnly);

router.get(
  '/',
  query('search').optional().isString(),
  query('status').optional().isIn(['active', 'inactive']),
  asyncHandler(async (req, res) => {
    let q = supabase.from('car_models').select('*').order('model_name');
    if (req.query.status) q = q.eq('status', req.query.status);
    const { data, error } = await q;
    if (error) throw new AppError(error.message, 500);

    let result = data || [];
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.model_name.toLowerCase().includes(s) ||
          c.suffix.toLowerCase().includes(s) ||
          c.variant.toLowerCase().includes(s)
      );
    }
    res.json(result);
  })
);

router.post(
  '/',
  body('model_name').trim().notEmpty(),
  body('suffix').optional().isString(),
  body('variant').optional().isString(),
  body('status').optional().isIn(['active', 'inactive']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { data, error } = await supabase
      .from('car_models')
      .insert({
        model_name: req.body.model_name,
        suffix: req.body.suffix || '',
        variant: req.body.variant || '',
        status: req.body.status || 'active',
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'CREATE', 'car_models', data.id);
    res.status(201).json(data);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('car_models')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'UPDATE', 'car_models', req.params.id);
    res.json(data);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { error } = await supabase.from('car_models').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'DELETE', 'car_models', req.params.id);
    res.status(204).send();
  })
);

export default router;