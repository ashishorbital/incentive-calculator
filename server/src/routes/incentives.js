import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate);

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    let q = supabase
      .from('incentive_calculations')
      .select('*, incentive_slabs(min_units, max_units, incentive_per_car)')
      .order('month', { ascending: false });

    if (req.user.role === 'sales_officer') {
      q = q.eq('officer_id', req.user.id);
    } else if (req.query.officer_id) {
      q = q.eq('officer_id', req.query.officer_id);
    }

    if (req.query.year) {
      const y = Number(req.query.year);
      q = q.gte('month', `${y}-01-01`).lte('month', `${y}-12-01`);
    }
    if (req.query.month) {
      const m = new Date(req.query.month);
      const monthStr = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-01`;
      q = q.eq('month', monthStr);
    }

    const { data, error } = await q;
    if (error) throw new AppError(error.message, 500);
    res.json(data);
  })
);

export default router;
