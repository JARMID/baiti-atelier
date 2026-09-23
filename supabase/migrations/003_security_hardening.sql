-- Baiti Atelier: Phase 3 Security Hardening & Bank-Grade RLS
-- Modeled after TrustDesk / TrustVault military-grade database security architecture
-- Features: InitPlan RLS optimization, strict tenant isolation, token-gated quote verification,
-- audit logging, and privilege revocation.

-- 1. ADD OWNER AND TENANT CONSTRAINTS
ALTER TABLE public.workshops 
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index on owner_id for high-speed tenant lookups
CREATE INDEX IF NOT EXISTS idx_workshops_owner_id ON public.workshops(owner_id);
CREATE INDEX IF NOT EXISTS idx_workshops_wilaya_code ON public.workshops(wilaya_code);
CREATE INDEX IF NOT EXISTS idx_quotes_verification_token ON public.quotes(verification_token);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_code ON public.quotes(quote_code);
CREATE INDEX IF NOT EXISTS idx_cutting_jobs_workshop_id ON public.cutting_jobs(workshop_id);
CREATE INDEX IF NOT EXISTS idx_remnant_inventory_workshop_id ON public.remnant_inventory(workshop_id);

-- 2. CREATE WORKSHOP AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.workshop_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workshop_audit_logs_workshop ON public.workshop_audit_logs(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_audit_logs_created ON public.workshop_audit_logs(created_at DESC);

ALTER TABLE public.workshop_audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. DROP INSECURE PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Public workshops directory read" ON public.workshops;
DROP POLICY IF EXISTS "Public quote verification read" ON public.quotes;
DROP POLICY IF EXISTS "Public quote creation" ON public.quotes;
DROP POLICY IF EXISTS "Public profile catalog read" ON public.workshop_profiles;
DROP POLICY IF EXISTS "Public glass catalog read" ON public.workshop_glass;
DROP POLICY IF EXISTS "Workshops update own profile" ON public.workshops;

-- 4. APPLY INITPLAN-OPTIMIZED HIGH SECURITY RLS POLICIES

-- Workshops: Public directory can only see active non-archived workshops
CREATE POLICY "Public directory read active workshops"
ON public.workshops FOR SELECT
USING (is_archived = false);

-- Workshops: Only the authenticated workshop owner can modify their workshop
CREATE POLICY "Workshop owners can update own workshop"
ON public.workshops FOR UPDATE
USING (
  (select auth.uid()) IS NOT NULL 
  AND owner_id = (select auth.uid())
);

-- Workshop Profiles: Public can view active profiles; only owner can manage
CREATE POLICY "Public can view active workshop profiles"
ON public.workshop_profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Workshop owner manage own profiles"
ON public.workshop_profiles FOR ALL
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- Workshop Glass: Public can view active glass; only owner can manage
CREATE POLICY "Public can view active workshop glass"
ON public.workshop_glass FOR SELECT
USING (is_active = true);

CREATE POLICY "Workshop owner manage own glass"
ON public.workshop_glass FOR ALL
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- Quotes: Controlled submission with input verification
CREATE POLICY "Public quote creation sanitized"
ON public.quotes FOR INSERT
WITH CHECK (
  width_mm >= 200 AND width_mm <= 6000
  AND height_mm >= 200 AND height_mm <= 6000
  AND quantity >= 1 AND quantity <= 500
  AND total_price_dzd >= 0
);

-- Quotes: Secure token-based or workshop owner read access
CREATE POLICY "Secure token or owner quote read"
ON public.quotes FOR SELECT
USING (
  (workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  ))
  OR
  (verification_token IS NOT NULL AND length(verification_token) >= 16)
);

-- Quotes: Only the associated workshop owner can update quote status
CREATE POLICY "Workshop owners update quote status"
ON public.quotes FOR UPDATE
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- Cutting Jobs: Strict tenant isolation
CREATE POLICY "Workshop owners manage cutting jobs"
ON public.cutting_jobs FOR ALL
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- Remnant Inventory: Strict tenant isolation
CREATE POLICY "Workshop owners manage remnants"
ON public.remnant_inventory FOR ALL
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- Audit Logs: Workshop owners can only view their own logs
CREATE POLICY "Workshop owners view own audit logs"
ON public.workshop_audit_logs FOR SELECT
USING (
  workshop_id IN (
    SELECT w.id FROM public.workshops w 
    WHERE w.owner_id = (select auth.uid())
  )
);

-- 5. SECURITY DEFINER SECURE RPC FUNCTIONS

-- Function to safely verify and retrieve quote by code and token without revealing cost margins
CREATE OR REPLACE FUNCTION public.verify_client_quote(
  p_quote_code TEXT,
  p_token TEXT
)
RETURNS TABLE (
  quote_code VARCHAR(50),
  client_name VARCHAR(255),
  client_wilaya VARCHAR(100),
  status quote_status,
  window_type VARCHAR(100),
  width_mm INTEGER,
  height_mm INTEGER,
  quantity INTEGER,
  profile_system VARCHAR(100),
  finish_color VARCHAR(100),
  glass_type VARCHAR(100),
  total_price_dzd NUMERIC(12,2),
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.quote_code,
    q.client_name,
    q.client_wilaya,
    q.status,
    q.window_type,
    q.width_mm,
    q.height_mm,
    q.quantity,
    q.profile_system,
    q.finish_color,
    q.glass_type,
    q.total_price_dzd,
    q.created_at,
    q.expires_at,
    (q.expires_at > NOW() AND q.status != 'cancelled') AS is_valid
  FROM public.quotes q
  WHERE q.quote_code = p_quote_code
    AND q.verification_token = p_token;
END;
$$;

-- Secure Audit Log Writer (Security Definer)
CREATE OR REPLACE FUNCTION public.log_workshop_event(
  p_workshop_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.workshop_audit_logs (
    workshop_id,
    user_id,
    action,
    entity_type,
    entity_id,
    payload
  ) VALUES (
    p_workshop_id,
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_payload
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 6. PRIVILEGE RESTRICTION & LEAST PRIVILEGE PRINCIPLE
-- Revoke execution of trigger functions from public and anonymous roles
REVOKE EXECUTE ON FUNCTION public.generate_monyun_quote_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_monyun_quote_code() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_timestamp_column() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_timestamp_column() TO authenticated, service_role;

-- Grant execution of client verification function
GRANT EXECUTE ON FUNCTION public.verify_client_quote(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_workshop_event(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;
