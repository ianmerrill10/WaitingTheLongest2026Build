-- Migration 003: Dog Submissions + Marketing Leads
-- Intake portal data tables
-- Run once against Supabase project: psql $DATABASE_URL -f 003_submissions.sql

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE submitter_type AS ENUM (
    'individual',   -- private person with a dog
    'rescue',       -- rescue/foster network
    'shelter'       -- licensed shelter or animal control
);

CREATE TYPE submission_status AS ENUM (
    'pending',      -- awaiting review
    'approved',     -- moved to animals table
    'rejected',     -- rejected by admin
    'duplicate'     -- duplicate of existing animal
);

-- ============================================================
-- TABLE: dog_submissions
-- Holds all intake form submissions before admin approval.
-- Approved rows get copied into the animals table.
-- ============================================================

CREATE TABLE IF NOT EXISTS dog_submissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Submitter identity (Step 1 + Step 2 of intake form)
    submitter_type      submitter_type NOT NULL,
    submitter_name      TEXT NOT NULL,                  -- full name
    submitter_email     TEXT NOT NULL,
    submitter_phone     TEXT,
    submitter_social    TEXT,                           -- @handle or profile URL
    org_name            TEXT,                           -- rescue/shelter name
    org_website         TEXT,
    org_ein             TEXT,                           -- EIN (required for shelters)
    submitter_ip        INET,                           -- captured at submission time
    submitter_ua        TEXT,                           -- user agent

    -- Dog details (Step 3)
    dog_name            TEXT NOT NULL,
    intake_date         DATE NOT NULL,                  -- THE core field — clock starts here
    breed_primary       TEXT NOT NULL,
    breed_secondary     TEXT,
    is_mixed            BOOLEAN NOT NULL DEFAULT false,
    age_months          INTEGER,                        -- approximate age
    size                TEXT,                           -- small/medium/large/xlarge
    sex                 TEXT,                           -- male/female/unknown
    altered             TEXT DEFAULT 'unknown',         -- yes/no/unknown
    description         TEXT,                           -- max 500 chars enforced in frontend
    good_with_dogs      TEXT DEFAULT 'unknown',
    good_with_cats      TEXT DEFAULT 'unknown',
    good_with_kids      TEXT DEFAULT 'unknown',
    special_needs       BOOLEAN NOT NULL DEFAULT false,
    special_needs_desc  TEXT,
    location_city       TEXT NOT NULL,
    location_state      CHAR(2) NOT NULL,               -- e.g. 'MA', 'CA'
    listing_url         TEXT,                           -- optional external listing

    -- Photos (Step 4)
    -- URLs stored after upload to Supabase Storage
    photo_urls          TEXT[] NOT NULL DEFAULT '{}',
    primary_photo_url   TEXT,

    -- Legal agreement (Step 5)
    agreed_accuracy     BOOLEAN NOT NULL DEFAULT false,
    agreed_terms        BOOLEAN NOT NULL DEFAULT false,
    agreed_marketing    BOOLEAN NOT NULL DEFAULT false, -- opt-in only

    -- Status tracking
    status              submission_status NOT NULL DEFAULT 'pending',
    reviewed_by         TEXT,                           -- admin email who reviewed
    reviewed_at         TIMESTAMPTZ,
    review_notes        TEXT,
    approved_animal_id  UUID,                           -- FK to animals.id after approval

    -- Timestamps
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: marketing_leads
-- Holds emails from agreed_marketing=true submissions
-- GDPR/CCPA compliant: separate table with explicit opt-in tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS marketing_leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    name            TEXT,
    source          TEXT NOT NULL DEFAULT 'submission_form',
    opted_in_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opted_out_at    TIMESTAMPTZ,                        -- NULL = still subscribed
    ip_address      INET,
    submission_id   UUID REFERENCES dog_submissions(id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_dog_submissions_status
    ON dog_submissions(status);

CREATE INDEX IF NOT EXISTS idx_dog_submissions_submitted_at
    ON dog_submissions(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_dog_submissions_email
    ON dog_submissions(submitter_email);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_email
    ON marketing_leads(email);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_opted_out
    ON marketing_leads(opted_out_at)
    WHERE opted_out_at IS NULL;    -- partial index for active subscribers

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't already exist (001_initial.sql may have defined the function)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_dog_submissions_updated_at'
    ) THEN
        CREATE TRIGGER set_dog_submissions_updated_at
            BEFORE UPDATE ON dog_submissions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE dog_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

-- Public: no direct read access to submissions (admin-only)
-- The Next.js API route uses the service role key (bypasses RLS)
-- So we just deny all by default; the API route is the only path in.

CREATE POLICY "deny_all_direct_access" ON dog_submissions
    FOR ALL TO anon, authenticated
    USING (false);

CREATE POLICY "deny_all_direct_access" ON marketing_leads
    FOR ALL TO anon, authenticated
    USING (false);

-- ============================================================
-- GRANT: service role bypasses RLS automatically in Supabase
-- No explicit grant needed — service_role key handles it.
-- ============================================================

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE dog_submissions IS
    'Intake portal submissions awaiting admin review. Approved rows are copied into the animals table.';

COMMENT ON TABLE marketing_leads IS
    'Email marketing opt-ins from submission form. Separate table for GDPR/CCPA compliance.';

COMMENT ON COLUMN dog_submissions.intake_date IS
    'The date the dog entered shelter/rescue/foster care. This is THE clock — days_waiting = TODAY - intake_date.';

COMMENT ON COLUMN dog_submissions.org_ein IS
    'EIN required for shelters (Tier 1+ verification). Optional for rescues. Never for individuals.';
