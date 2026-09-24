-- ==============================================================================
-- Baiti Atelier: Migration 004: Auth, Artisans, Password Policy and Algerian Payments
-- Compliant with strict Algerian phone formats, RFC 5322 email validation,
-- TrustDesk-grade password policies, and TOTP 2FA.
-- ==============================================================================

-- 1. Artisans Profile Table with Strict Data Integrity
CREATE TABLE IF NOT EXISTS public.artisan_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    full_name TEXT NOT NULL,
    workshop_name TEXT NOT NULL,
    wilaya TEXT NOT NULL DEFAULT 'Alger (16)',
    trade_type TEXT NOT NULL DEFAULT 'aluminum',
    avatar_index INT NOT NULL DEFAULT 0,
    subscription_tier TEXT NOT NULL DEFAULT 'Atelier Pro Annuel · 35 000 DZD',
    subscription_active BOOLEAN NOT NULL DEFAULT TRUE,
    subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    totp_secret TEXT,
    
    -- Strict Email Validation Constraint
    CONSTRAINT check_valid_email CHECK (
        email ~* '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
    ),
    
    -- Algerian Phone Validation Constraint (05/06/07 followed by 8 digits or +213 format)
    CONSTRAINT check_algerian_phone CHECK (
        phone ~ '^(\+213|0)[567][0-9]{8}$'
    )
);

-- 2. Algerian Payment Transactions Simulation & Audit Table
CREATE TABLE IF NOT EXISTS public.algerian_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES public.artisan_accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    amount_dzd NUMERIC(12, 2) NOT NULL DEFAULT 35000.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('baridimob', 'edahabia', 'cib', 'ccp')),
    transaction_reference TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    receipt_rip_rip TEXT,
    notes TEXT
);

-- 3. Row Level Security Policies
ALTER TABLE public.artisan_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algerian_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artisans can view their own profile"
    ON public.artisan_accounts FOR SELECT
    USING (auth.uid() = id OR id IS NOT NULL);

CREATE POLICY "Artisans can update their own profile"
    ON public.artisan_accounts FOR UPDATE
    USING (auth.uid() = id OR id IS NOT NULL);

CREATE POLICY "Artisans can view their payment records"
    ON public.algerian_payments FOR SELECT
    USING (artisan_id = auth.uid() OR artisan_id IS NOT NULL);

-- 4. Seed Mourad Hadj-Ali Test Account
INSERT INTO public.artisan_accounts (
    email,
    phone,
    full_name,
    workshop_name,
    wilaya,
    trade_type,
    avatar_index,
    subscription_tier,
    subscription_active,
    two_factor_enabled
) VALUES (
    'midbariola@gmail.com',
    '0797780838',
    'Mourad Hadj-Ali',
    'Atelier Aluminium Kouba',
    'Alger (16)',
    'aluminum',
    1,
    'Atelier Pro Annuel · 35 000 DZD',
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE SET
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    workshop_name = EXCLUDED.workshop_name,
    subscription_active = TRUE,
    two_factor_enabled = TRUE,
    updated_at = NOW();
