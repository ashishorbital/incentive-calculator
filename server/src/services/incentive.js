import { supabase } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';

/** Find active slab for total units on given month */
export async function findApplicableSlab(totalUnits, monthDate) {
  const monthStart = new Date(monthDate);
  monthStart.setDate(1);

  const { data: slabs, error } = await supabase
    .from('incentive_slabs')
    .select('*')
    .eq('status', 'active')
    .lte('effective_date', monthStart.toISOString().slice(0, 10))
    .order('min_units', { ascending: false });

  if (error) throw new AppError(error.message, 500);

  const match = (slabs || []).find((s) => {
    const inMin = totalUnits >= s.min_units;
    const inMax = s.max_units == null || totalUnits <= s.max_units;
    return inMin && inMax;
  });

  return match || null;
}

export function calculateIncentive(totalUnits, slab) {
  if (!slab || totalUnits <= 0) {
    return {
      total_sales: totalUnits,
      slab_id: null,
      incentive_per_car: 0,
      total_incentive: 0,
      slab: null,
    };
  }
  const perCar = Number(slab.incentive_per_car);
  return {
    total_sales: totalUnits,
    slab_id: slab.id,
    incentive_per_car: perCar,
    total_incentive: totalUnits * perCar,
    slab,
  };
}

export async function getOfficerMonthTotal(officerId, month) {
  const { data, error } = await supabase
    .from('sales_records')
    .select('units_sold')
    .eq('officer_id', officerId)
    .eq('month', month)
    .eq('status', 'submitted');

  if (error) throw new AppError(error.message, 500);
  return (data || []).reduce((sum, r) => sum + r.units_sold, 0);
}

export async function persistCalculation(officerId, month, calc) {
  const row = {
    officer_id: officerId,
    month,
    total_sales: calc.total_sales,
    slab_id: calc.slab_id,
    incentive_per_car: calc.incentive_per_car,
    total_incentive: calc.total_incentive,
  };

  const { data, error } = await supabase
    .from('incentive_calculations')
    .upsert(row, { onConflict: 'officer_id,month' })
    .select()
    .single();

  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function previewCalculation(officerId, month) {
  const { data: draftRows } = await supabase
    .from('sales_records')
    .select('units_sold, status')
    .eq('officer_id', officerId)
    .eq('month', month);

  const totalUnits = (draftRows || [])
    .filter((r) => r.status === 'submitted' || r.status === 'draft')
    .reduce((sum, r) => sum + r.units_sold, 0);

  const slab = await findApplicableSlab(totalUnits, month);
  const calc = calculateIncentive(totalUnits, slab);
  return { ...calc, month };
}
