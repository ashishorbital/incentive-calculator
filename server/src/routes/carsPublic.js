import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();

router.get(
  '/active',
  authenticate,
  asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('car_models')
      .select('id, model_name, suffix, variant, status')
      .eq('status', 'active')
      .order('model_name');
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
