import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();
router.use(authenticate, adminOnly);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.post(
  '/',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'sales_officer']),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const hash = await bcrypt.hash(req.body.password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: req.body.name,
        email: req.body.email,
        password: hash,
        role: req.body.role,
      })
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Email already exists', 409);
      throw new AppError(error.message, 500);
    }
    await logAudit(req.user.id, 'CREATE', 'users', data.id);
    res.status(201).json(data);
  })
);

router.patch(
  '/:id',
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'sales_officer']),
  asyncHandler(async (req, res) => {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'UPDATE', 'users', req.params.id);
    res.json(data);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) throw new AppError('Cannot delete yourself', 400);
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw new AppError(error.message, 500);
    await logAudit(req.user.id, 'DELETE', 'users', req.params.id);
    res.status(204).send();
  })
);

export default router;
