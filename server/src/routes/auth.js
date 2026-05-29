import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) throw new AppError('Invalid email or password', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);

    await logAudit(user.id, 'LOGIN', 'users', user.id);
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
