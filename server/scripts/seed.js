import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function seed() {
  const password = await bcrypt.hash('Admin@123', 10);

  const { data: admin, error: adminErr } = await supabase
    .from('users')
    .upsert(
      {
        email: 'admin@incentive.com',
        name: 'System Admin',
        password,
        role: 'admin',
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (adminErr) {
    console.error('Admin seed failed:', adminErr.message);
    process.exit(1);
  }

  const officerPass = await bcrypt.hash('Officer@123', 10);
  await supabase.from('users').upsert(
    {
      email: 'officer@incentive.com',
      name: 'Demo Sales Officer',
      password: officerPass,
      role: 'sales_officer',
    },
    { onConflict: 'email' }
  );

  const slabs = [
    { min_units: 1, max_units: 3, incentive_per_car: 1000, effective_date: '2025-01-01' },
    { min_units: 4, max_units: 7, incentive_per_car: 2000, effective_date: '2025-01-01' },
    { min_units: 8, max_units: null, incentive_per_car: 3500, effective_date: '2025-01-01' },
  ];

  for (const slab of slabs) {
    const { count } = await supabase
      .from('incentive_slabs')
      .select('*', { count: 'exact', head: true })
      .eq('min_units', slab.min_units);

    if (!count) await supabase.from('incentive_slabs').insert({ ...slab, status: 'active' });
  }

  const cars = [
    { model_name: 'Swift', suffix: 'ZXI', variant: 'Petrol', status: 'active' },
    { model_name: 'Baleno', suffix: 'Alpha', variant: 'Hybrid', status: 'active' },
    { model_name: 'Brezza', suffix: 'VXI', variant: 'Diesel', status: 'active' },
  ];

  for (const car of cars) {
    const { count } = await supabase
      .from('car_models')
      .select('*', { count: 'exact', head: true })
      .eq('model_name', car.model_name);
    if (!count) await supabase.from('car_models').insert(car);
  }

  console.log('Seed complete.');
  console.log('Admin: admin@incentive.com / Admin@123');
  console.log('Officer: officer@incentive.com / Officer@123');
}

seed();
