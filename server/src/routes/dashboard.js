import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate, adminOnly);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [officers, sales, incentives, slabs, calcs] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'sales_officer'),
      supabase.from('sales_records').select('units_sold').eq('status', 'submitted'),
      supabase.from('incentive_calculations').select('total_incentive, month, officer_id, total_sales'),
      supabase.from('incentive_slabs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase
        .from('incentive_calculations')
        .select('officer_id, total_sales, total_incentive, users(name)')
        .order('total_sales', { ascending: false })
        .limit(5),
    ]);

    const totalCars = (sales.data || []).reduce((s, r) => s + r.units_sold, 0);
    const totalPaid = (incentives.data || []).reduce((s, r) => s + Number(r.total_incentive), 0);

    const monthlyMap = {};
    for (const row of incentives.data || []) {
      const key = row.month;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, sales: 0, incentives: 0 };
      monthlyMap[key].sales += row.total_sales;
      monthlyMap[key].incentives += Number(row.total_incentive);
    }
    const trends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      cards: {
        totalOfficers: officers.count ?? 0,
        totalCarsSold: totalCars,
        totalIncentivesPaid: totalPaid,
        activeSlabs: slabs.count ?? 0,
      },
      trends,
      topPerformers: calcs.data || [],
    });
  })
);

export default router;
