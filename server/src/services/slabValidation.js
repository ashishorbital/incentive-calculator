import { supabase } from '../config/supabase.js';

export function rangesOverlap(a, b) {
  const aMax = a.max_units ?? Infinity;
  const bMax = b.max_units ?? Infinity;
  return a.min_units <= bMax && b.min_units <= aMax;
}

export async function validateNoOverlap({ min_units, max_units, effective_date, excludeId }) {
  const { data: existing } = await supabase
    .from('incentive_slabs')
    .select('id, min_units, max_units, effective_date, status')
    .eq('status', 'active')
    .eq('effective_date', effective_date);

  const candidate = { min_units, max_units };
  for (const slab of existing || []) {
    if (excludeId && slab.id === excludeId) continue;
    if (rangesOverlap(candidate, slab)) {
      return { valid: false, message: 'Slab range overlaps with an existing active slab' };
    }
  }
  return { valid: true };
}
