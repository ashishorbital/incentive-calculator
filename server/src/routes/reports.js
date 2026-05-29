import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { asyncHandler, AppError } from '../utils/errors.js';

const router = Router();
router.use(authenticate, adminOnly);

async function buildMonthlySalesReport(month) {
  const { data: calcs, error } = await supabase
    .from('incentive_calculations')
    .select('*, users(name, email)')
    .eq('month', month);

  if (error) throw new AppError(error.message, 500);
  return (calcs || []).map((c) => ({
    officerName: c.users?.name,
    email: c.users?.email,
    carsSold: c.total_sales,
    incentiveEarned: Number(c.total_incentive),
    month: c.month,
  }));
}

async function buildIncentiveReport(month) {
  const { data, error } = await supabase
    .from('incentive_calculations')
    .select('*, incentive_slabs(min_units, max_units, incentive_per_car), users(name)')
    .eq('month', month);

  if (error) throw new AppError(error.message, 500);

  const totalPayout = (data || []).reduce((s, r) => s + Number(r.total_incentive), 0);
  return {
    month,
    totalPayout,
    rows: (data || []).map((r) => ({
      officerName: r.users?.name,
      slabApplied: r.incentive_slabs
        ? `${r.incentive_slabs.min_units}-${r.incentive_slabs.max_units ?? '∞'} @ ₹${r.incentive_slabs.incentive_per_car}`
        : 'N/A',
      totalPayout: Number(r.total_incentive),
      carsSold: r.total_sales,
    })),
  };
}

router.get(
  '/sales',
  asyncHandler(async (req, res) => {
    const month = req.query.month;
    if (!month) throw new AppError('month query parameter required', 400);
    const d = new Date(month);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const report = await buildMonthlySalesReport(monthStr);
    res.json(report);
  })
);

router.get(
  '/incentives',
  asyncHandler(async (req, res) => {
    const month = req.query.month;
    if (!month) throw new AppError('month query parameter required', 400);
    const d = new Date(month);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const report = await buildIncentiveReport(monthStr);
    res.json(report);
  })
);

router.get(
  '/export/csv',
  asyncHandler(async (req, res) => {
    const type = req.query.type || 'sales';
    const month = req.query.month;
    if (!month) throw new AppError('month required', 400);
    const d = new Date(month);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;

    let csv = '';
    if (type === 'sales') {
      const rows = await buildMonthlySalesReport(monthStr);
      csv = 'Officer,Cars Sold,Incentive Earned\n';
      csv += rows.map((r) => `"${r.officerName}",${r.carsSold},${r.incentiveEarned}`).join('\n');
    } else {
      const report = await buildIncentiveReport(monthStr);
      csv = 'Officer,Slab,Cars Sold,Payout\n';
      csv += report.rows
        .map((r) => `"${r.officerName}","${r.slabApplied}",${r.carsSold},${r.totalPayout}`)
        .join('\n');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${monthStr}.csv"`);
    res.send(csv);
  })
);

export default router;
