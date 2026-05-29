import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.patch(
  '/',
  body('name').optional().trim().notEmpty(),
  body('password').optional().isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
