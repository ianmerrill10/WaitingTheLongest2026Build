-- WaitingTheLongest.com — Initial Schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name TEXT NOT NULL,
    ein TEXT UNIQUE,
    website TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    org_type TEXT NOT NULL CHECK (org_type IN ('municipal','humane_society','spca','rescue','foster_network','sanctuary','other')),
    postal_code TEXT,
    state CHAR(2),
    country CHAR(2) NOT NULL DEFAULT 'US',
    verification_tier TEXT NOT NULL DEFAULT 'tier_0_self_asserted' CHECK (verification_tier IN ('tier_0_self_asserted','tier_1_verified','tier_2_trusted')),
    verification_method TEXT CHECK (verification_method IN ('ein_pub78','gov_domain','aggregator_confirmed','manual_review')),
    rate_limit_per_hour INTEGER NOT NULL DEFAULT 60,
    active_listings INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('tier_0_self_asserted','tier_1_verified','tier_2_trusted')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Animals
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    external_id TEXT NOT NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('dog','cat','rabbit','equine','small_mammal','bird','reptile_amphibian','farm_animal','other')),
    species_detail TEXT,
    intake_date DATE NOT NULL,
    intake_type TEXT,
    sex TEXT CHECK (sex IN ('male','female','unknown')),
    altered TEXT CHECK (altered IN ('altered','intact','unknown')),
    size TEXT CHECK (size IN ('small','medium','large','xlarge')),
    primary_breed TEXT,
    secondary_breed TEXT,
    is_mixed BOOLEAN,
    primary_color TEXT,
    coat_length TEXT,
    estimated_birthdate DATE,
    age_months INTEGER,
    sac_age_group TEXT CHECK (sac_age_group IN ('under_5_months','adult','unknown')),
    weight_kg NUMERIC,
    description TEXT CHECK (length(description) <= 5000),
    adoption_fee NUMERIC,
    adoption_fee_currency CHAR(3) DEFAULT 'USD',
    special_needs BOOLEAN DEFAULT FALSE,
    good_with_dogs TEXT CHECK (good_with_dogs IN ('yes','no','unknown')),
    good_with_cats TEXT CHECK (good_with_cats IN ('yes','no','unknown')),
    good_with_kids TEXT CHECK (good_with_kids IN ('yes','no','unknown')),
    photo_urls JSONB DEFAULT '[]'::jsonb,
    listing_url TEXT,
    status TEXT NOT NULL DEFAULT 'adoptable' CHECK (status IN ('adoptable','pending','adopted','on_hold','not_available','removed')),
    location_postal_code TEXT,
    location_city TEXT,
    location_state CHAR(2),
    location_country CHAR(2) DEFAULT 'US',
    intake_age_days INTEGER GENERATED ALWAYS AS (current_date - intake_date) STORED,
    confidence_score NUMERIC DEFAULT 0.5,
    source TEXT DEFAULT 'intake_api',
    submitter_verification_tier TEXT,
    is_canonical BOOLEAN DEFAULT TRUE,
    canonical_id UUID,
    first_listed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, external_id)
);

-- Status History
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    outcome_type TEXT,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Batch Jobs
CREATE TABLE batch_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted','processing','completed','failed')),
    received INTEGER NOT NULL DEFAULT 0,
    succeeded INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    results JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Batch data (persistent, replaces DeepSeek's temp table approach)
CREATE TABLE batch_animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
    animal_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_animals_intake_adoptable_dog ON animals(intake_date ASC) WHERE status = 'adoptable' AND species = 'dog';
CREATE UNIQUE INDEX idx_animals_org_external ON animals(organization_id, external_id);
CREATE INDEX idx_animals_species_status ON animals(species, status);
CREATE INDEX idx_animals_state_status ON animals(location_state, status);
CREATE INDEX idx_organizations_ein ON organizations(ein) WHERE ein IS NOT NULL;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_batch_animals_job ON batch_animals(job_id);

-- Row Level Security
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read animals" ON animals FOR SELECT USING (true);
CREATE POLICY "Public read organizations" ON organizations FOR SELECT USING (true);
