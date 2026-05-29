import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
