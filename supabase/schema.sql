-- Smart Incentive Calculator - Supabase PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'sales_officer');
CREATE TYPE record_status AS ENUM ('active', 'inactive');
CREATE TYPE sales_status AS ENUM ('draft', 'submitted');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_officer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  suffix TEXT NOT NULL DEFAULT '',
  variant TEXT NOT NULL DEFAULT '',
  status record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE incentive_slabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_units INTEGER NOT NULL CHECK (min_units >= 0),
  max_units INTEGER,
  incentive_per_car DECIMAL(12, 2) NOT NULL CHECK (incentive_per_car > 0),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (max_units IS NULL OR max_units > min_units)
);

CREATE TABLE sales_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  model_id UUID NOT NULL REFERENCES car_models(id),
  units_sold INTEGER NOT NULL CHECK (units_sold > 0),
  status sales_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (officer_id, month, model_id)
);

CREATE TABLE incentive_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  officer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_sales INTEGER NOT NULL,
  slab_id UUID REFERENCES incentive_slabs(id),
  incentive_per_car DECIMAL(12, 2) NOT NULL,
  total_incentive DECIMAL(14, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (officer_id, month)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_officer_month ON sales_records(officer_id, month);
CREATE INDEX idx_slabs_effective ON incentive_slabs(effective_date, status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- Run server/scripts/seed.js after schema to create demo users and sample data
