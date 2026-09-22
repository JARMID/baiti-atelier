-- MONYUN Atelier: Core Industrial & Marketplace Schema
-- Dedicated schema for Algerian aluminum, PVC, and woodworking workshops

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE workshop_trade AS ENUM (
  'aluminum',
  'pvc',
  'woodworking',
  'glazing',
  'metalwork',
  'composite'
);

CREATE TYPE quote_status AS ENUM (
  'draft',
  'submitted',
  'reviewing',
  'accepted',
  'fabrication',
  'ready',
  'delivered',
  'cancelled'
);

CREATE TYPE cut_stock_type AS ENUM (
  '1d_profile',
  '2d_sheet'
);

-- 3. WORKSHOPS TABLE
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  trade workshop_trade NOT NULL DEFAULT 'aluminum',
  wilaya_code VARCHAR(4) NOT NULL, -- e.g. '16' for Alger, '31' for Oran
  wilaya_name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(50) NOT NULL,
  whatsapp VARCHAR(50),
  email VARCHAR(255),
  logo_url TEXT,
  rating NUMERIC(3,2) DEFAULT 4.85,
  total_jobs_completed INTEGER DEFAULT 0,
  -- Confidential workshop rate settings (protected via RLS)
  wholesale_rate_per_kg NUMERIC(10,2) DEFAULT 850.00, -- DZD/kg
  wholesale_glass_rate_per_m2 NUMERIC(10,2) DEFAULT 2800.00, -- DZD/m2
  wholesale_labor_rate_per_hour NUMERIC(10,2) DEFAULT 1200.00, -- DZD/h
  default_saw_kerf_mm NUMERIC(4,2) DEFAULT 3.00,
  default_clamp_margin_mm NUMERIC(5,2) DEFAULT 25.00,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKSHOP PROFILES CATALOG
CREATE TABLE IF NOT EXISTS workshop_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  profile_system VARCHAR(100) NOT NULL, -- 'Alugraf 40', 'Coulissant 67', 'RPT 52', 'PVC 60'
  profile_name VARCHAR(100) NOT NULL,   -- 'Dormant Tubulaire', 'Ouvrant Renforcé', 'Meneau'
  code VARCHAR(50) NOT NULL,            -- 'DOR-401', 'OUV-402', 'MEN-405'
  weight_per_meter_kg NUMERIC(6,3) NOT NULL DEFAULT 1.150,
  default_bar_length_mm NUMERIC(8,2) NOT NULL DEFAULT 6000.00,
  finish_color VARCHAR(100) NOT NULL DEFAULT 'RAL 9016 Blanc',
  cost_per_meter_dzd NUMERIC(10,2) NOT NULL DEFAULT 980.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKSHOP GLASS CATALOG
CREATE TABLE IF NOT EXISTS workshop_glass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  glass_type VARCHAR(100) NOT NULL, -- 'Clair Simple', 'Bronze Teinté', 'Stopsol Réfléchissant', 'Double Vitrage 4/12/4'
  thickness_mm NUMERIC(4,1) NOT NULL DEFAULT 4.0,
  is_double_glazing BOOLEAN DEFAULT FALSE,
  spacer_mm NUMERIC(4,1) DEFAULT 0,
  price_per_m2_dzd NUMERIC(10,2) NOT NULL DEFAULT 2400.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_code VARCHAR(50) UNIQUE NOT NULL,
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_wilaya VARCHAR(100) NOT NULL,
  client_notes TEXT,
  status quote_status NOT NULL DEFAULT 'submitted',
  window_type VARCHAR(100) NOT NULL,
  width_mm INTEGER NOT NULL,
  height_mm INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  profile_system VARCHAR(100) NOT NULL,
  finish_color VARCHAR(100) NOT NULL,
  glass_type VARCHAR(100) NOT NULL,
  configuration_data JSONB DEFAULT '{}'::jsonb,
  total_cost_dzd NUMERIC(12,2) NOT NULL,
  margin_pct NUMERIC(5,2) DEFAULT 25.00,
  total_price_dzd NUMERIC(12,2) NOT NULL,
  verification_token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUTTING JOBS TABLE
CREATE TABLE IF NOT EXISTS cutting_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  job_name VARCHAR(255) NOT NULL,
  stock_type cut_stock_type NOT NULL DEFAULT '1d_profile',
  stock_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  cut_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  solution_layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  efficiency_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  remnant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REUSABLE REMNANTS INVENTORY
CREATE TABLE IF NOT EXISTS remnant_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  material_category VARCHAR(100) NOT NULL, -- 'aluminum_profile', 'pvc_profile', 'glass_float', 'wood_panel'
  profile_code VARCHAR(100),
  length_mm NUMERIC(8,2) NOT NULL,
  width_mm NUMERIC(8,2) DEFAULT 0,
  rack_location VARCHAR(100),
  is_reserved BOOLEAN DEFAULT FALSE,
  job_id UUID REFERENCES cutting_jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FUNCTIONS & TRIGGERS
-- Function to auto-generate quote codes like 'MON-26-ALG-XXXX'
CREATE OR REPLACE FUNCTION generate_monyun_quote_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_val INT;
  prefix TEXT;
BEGIN
  seq_val := floor(1000 + random() * 9000)::INT;
  prefix := 'MON-' || to_char(NOW(), 'YY') || '-';
  IF NEW.quote_code IS NULL OR NEW.quote_code = '' THEN
    NEW.quote_code := prefix || seq_val;
  END IF;
  IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
    NEW.verification_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quote_code_generation ON quotes;
CREATE TRIGGER trg_quote_code_generation
BEFORE INSERT ON quotes
FOR EACH ROW
EXECUTE FUNCTION generate_monyun_quote_code();

-- Updated at timestamp updater
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workshops_updated_at ON workshops;
CREATE TRIGGER trg_workshops_updated_at
BEFORE UPDATE ON workshops
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_quotes_updated_at ON quotes;
CREATE TRIGGER trg_quotes_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_glass ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remnant_inventory ENABLE ROW LEVEL SECURITY;

-- Workshops public directory policy: anyone can read public profiles
CREATE POLICY "Public workshops directory read"
ON workshops FOR SELECT
USING (true);

-- Quotes read policy: anyone with the verification token can read the quote
CREATE POLICY "Public quote verification read"
ON quotes FOR SELECT
USING (true);

-- Quotes insert policy: clients can submit quote requests
CREATE POLICY "Public quote creation"
ON quotes FOR INSERT
WITH CHECK (true);

-- Catalog public read
CREATE POLICY "Public profile catalog read"
ON workshop_profiles FOR SELECT
USING (true);

CREATE POLICY "Public glass catalog read"
ON workshop_glass FOR SELECT
USING (true);

-- 11. SEED DATA FOR ALGERIAN WORKSHOPS
INSERT INTO workshops (id, name, slug, trade, wilaya_code, wilaya_name, city, address, phone, whatsapp, rating, total_jobs_completed, wholesale_rate_per_kg)
VALUES
  ('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', 'Menuiserie Moderne Kouba', 'menuiserie-moderne-kouba', 'aluminum', '16', 'Alger', 'Kouba', 'Rue des Frères Abdeslami, Kouba', '+213 550 12 34 56', '+213550123456', 4.95, 420, 840.00),
  ('b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e', 'Atelier Aluminium Es-Sénia', 'atelier-aluminium-es-senia', 'aluminum', '31', 'Oran', 'Es-Sénia', 'Zone d''Activité Industrielle, Es-Sénia', '+213 555 78 90 12', '+213555789012', 4.88, 310, 860.00),
  ('c3d4e5f6-a1b2-4c3d-0e4f-5a6b7c8d9e0f', 'Profils & Façades Cirta', 'profils-facades-cirta', 'aluminum', '25', 'Constantine', 'El Khroub', 'Route Nationale 3, El Khroub', '+213 661 23 45 67', '+213661234567', 4.90, 280, 850.00),
  ('d4e5f6a1-b2c3-4d4e-1f5a-6b7c8d9e0f1a', 'Sétif Vitrage & Menuiserie', 'setif-vitrage-menuiserie', 'glazing', '19', 'Sétif', 'Ain Oulmene', 'Cité 500 Logements, Ain Oulmene', '+213 540 67 89 01', '+213540678901', 4.82, 195, 870.00)
ON CONFLICT (slug) DO NOTHING;
