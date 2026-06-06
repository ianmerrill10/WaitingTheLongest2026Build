-- ============================================================================
-- WaitingTheLongest.com — Initial schema migration
-- Target: Supabase (PostgreSQL 15+ with PostGIS)
-- File: 001_initial.sql
--
-- Assumes Supabase's standard roles exist: anon, authenticated, service_role.
-- Security model:
--   * Public (anon/authenticated) may READ adoptable listings and shelter
--     profiles. Sensitive organization columns (ein, contact info) are NOT
--     granted to public roles, so the public read path cannot expose them.
--   * All WRITES are performed by the backend using the service_role key,
--     which bypasses RLS. No write policies exist for public roles, so RLS
--     denies their writes by default.
--
-- Note on intake_age_days: it is intentionally NOT a stored column. Postgres
-- requires generated-column expressions to be IMMUTABLE, and CURRENT_DATE is
-- not; a stored value would also be stale after the day of insert. It is
-- computed live in the public.dog_listings view (as days_waiting) so the value
-- is always current. The authoritative source field intake_date lives on the
-- table.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ----------------------------------------------------------------------------
-- ENUM TYPES (controlled vocabularies; values match openapi.yaml exactly)
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE species_enum AS ENUM
    ('dog','cat','rabbit','equine','small_mammal','bird','reptile_amphibian','farm_animal','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE intake_type_enum AS ENUM
    ('stray_at_large','relinquished_by_owner','owner_intended_euthanasia',
     'transfer_in_in_state','transfer_in_out_of_state','seized_custody',
     'born_in_care','other_intake');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outcome_type_enum AS ENUM
    ('adoption','return_to_owner','transfer_out_in_state','transfer_out_out_of_state',
     'returned_to_field','other_live_outcome','died_in_care','lost_in_care','shelter_euthanasia');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status_enum AS ENUM
    ('adoptable','pending','adopted','on_hold','not_available','removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sex_enum AS ENUM ('male','female','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE altered_status_enum AS ENUM ('altered','intact','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE size_enum AS ENUM ('small','medium','large','xlarge');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE coat_length_enum AS ENUM
    ('hairless','short','medium','long','wire','curly','double','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sac_age_group_enum AS ENUM ('under_5_months','adult','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE trit_enum AS ENUM ('yes','no','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE org_type_enum AS ENUM
    ('municipal','humane_society','spca','rescue','foster_network','sanctuary','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_tier_enum AS ENUM
    ('tier_0_self_asserted','tier_1_verified','tier_2_trusted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE batch_status_enum AS ENUM ('accepted','processing','completed','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE photo_status_enum AS ENUM ('pending','uploaded','validated','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- ORGANIZATIONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name          text NOT NULL CHECK (char_length(legal_name) BETWEEN 2 AND 200),
  ein                 text CHECK (ein ~ '^\d{2}-?\d{7}$'),
  org_type            org_type_enum NOT NULL,
  verification_tier   verification_tier_enum NOT NULL DEFAULT 'tier_0_self_asserted',
  verification_method text,
  rate_limit_per_hour integer NOT NULL DEFAULT 100 CHECK (rate_limit_per_hour > 0),
  contact_email       text CHECK (contact_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  contact_phone       text CHECK (char_length(contact_phone) <= 32),
  website             text,
  postal_code         text CHECK (char_length(postal_code) <= 12),
  city                text CHECK (char_length(city) <= 80),
  state               char(2) CHECK (state ~ '^[A-Z]{2}$'),
  country             char(2) NOT NULL DEFAULT 'US' CHECK (country ~ '^[A-Z]{2}$'),
  active_listings     integer NOT NULL DEFAULT 0 CHECK (active_listings >= 0),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- API KEYS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.api_keys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  key_hash        text NOT NULL,                      -- bcrypt hash of the full key (computed in the app layer)
  key_prefix      text NOT NULL UNIQUE,               -- non-secret lookup prefix, e.g. wtl_3f8a9c2b
  tier            verification_tier_enum NOT NULL,
  label           text,
  is_active       boolean NOT NULL DEFAULT true,
  last_used_at    timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- ANIMALS  (AnimalCore fields + server-computed fields)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.animals (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id             uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,

  -- Identity / upsert key
  external_id                 text NOT NULL
                                CHECK (external_id ~ '^[A-Za-z0-9._:-]+$' AND char_length(external_id) <= 128),

  -- Core descriptive fields
  name                        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  species                     species_enum NOT NULL,
  species_detail              text CHECK (char_length(species_detail) <= 120),
  intake_date                 date NOT NULL CHECK (intake_date >= DATE '1990-01-01'),
  intake_type                 intake_type_enum,
  sex                         sex_enum,
  altered                     altered_status_enum,
  size                        size_enum,
  primary_breed               text CHECK (char_length(primary_breed) <= 80),
  secondary_breed             text CHECK (char_length(secondary_breed) <= 80),
  is_mixed                    boolean,
  primary_color               text CHECK (char_length(primary_color) <= 40),
  coat_length                 coat_length_enum,
  estimated_birthdate         date,
  age_months                  integer CHECK (age_months BETWEEN 0 AND 600),
  sac_age_group               sac_age_group_enum,
  weight_kg                   numeric(7,2) CHECK (weight_kg >= 0 AND weight_kg <= 1500),
  description                 text CHECK (char_length(description) <= 5000),
  adoption_fee                numeric(8,2) CHECK (adoption_fee >= 0 AND adoption_fee <= 100000),
  adoption_fee_currency       char(3) NOT NULL DEFAULT 'USD' CHECK (adoption_fee_currency ~ '^[A-Z]{3}$'),
  special_needs               boolean NOT NULL DEFAULT false,
  good_with_dogs              trit_enum,
  good_with_cats              trit_enum,
  good_with_kids              trit_enum,
  photo_urls                  text[] NOT NULL DEFAULT '{}',
  primary_photo_url           text GENERATED ALWAYS AS (photo_urls[1]) STORED,  -- array index is immutable, so this is allowed
  listing_url                 text,
  status                      listing_status_enum NOT NULL DEFAULT 'adoptable',

  -- Location (flattened from the submission "location" object; geocoded server-side)
  location_postal_code        text CHECK (char_length(location_postal_code) <= 12),
  location_city               text CHECK (char_length(location_city) <= 80),
  location_state              char(2) CHECK (location_state ~ '^[A-Z]{2}$'),
  location_country            char(2) NOT NULL DEFAULT 'US' CHECK (location_country ~ '^[A-Z]{2}$'),
  location_lat                numeric(9,6) CHECK (location_lat BETWEEN -90 AND 90),
  location_lng                numeric(9,6) CHECK (location_lng BETWEEN -180 AND 180),
  geog                        geography(Point, 4326),   -- maintained by trigger from lat/lng

  -- Server-computed / provenance
  source                      text NOT NULL DEFAULT 'intake_api',
  confidence_score            numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  submitter_verification_tier verification_tier_enum,
  canonical_id                uuid REFERENCES public.animals (id) ON DELETE SET NULL,
  is_canonical                boolean NOT NULL DEFAULT true,
  submitted_at                timestamptz,
  last_refreshed_at           timestamptz,
  last_verified_at            timestamptz,
  first_listed_at             timestamptz NOT NULL DEFAULT now(),
  last_seen_at                timestamptz NOT NULL DEFAULT now(),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),

  -- "other" species must carry a free-text detail (mirrors the OpenAPI if/then rule)
  CONSTRAINT species_detail_required_for_other
    CHECK (species <> 'other' OR species_detail IS NOT NULL),

  -- Idempotent upsert key
  CONSTRAINT animals_org_external_uk UNIQUE (organization_id, external_id)
);

-- ----------------------------------------------------------------------------
-- STATUS HISTORY  (written by the API status endpoint; carries outcome context)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.status_history (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id    uuid NOT NULL REFERENCES public.animals (id) ON DELETE CASCADE,
  old_status   listing_status_enum,
  new_status   listing_status_enum NOT NULL,
  outcome_type outcome_type_enum,
  effective_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- BATCH JOBS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.batch_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),  -- the job_id
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  status          batch_status_enum NOT NULL DEFAULT 'accepted',
  received        integer NOT NULL DEFAULT 0 CHECK (received  >= 0),
  succeeded       integer NOT NULL DEFAULT 0 CHECK (succeeded >= 0),
  failed          integer NOT NULL DEFAULT 0 CHECK (failed    >= 0),
  results         jsonb   NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- PHOTO UPLOADS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.photo_uploads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),  -- the upload_id
  animal_id       uuid REFERENCES public.animals (id) ON DELETE SET NULL,  -- may be uploaded before the animal exists
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  storage_path    text,
  content_type    text NOT NULL CHECK (content_type IN ('image/jpeg','image/png','image/webp')),
  byte_size       integer CHECK (byte_size > 0),
  perceptual_hash text,
  status          photo_status_enum NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------

-- Ranking: longest-waiting first means ORDER BY intake_date ASC. A partial
-- index over the hot path (adoptable, canonical) keeps browse/featured fast.
CREATE INDEX IF NOT EXISTS idx_animals_adoptable_ranking
  ON public.animals (species, intake_date)
  WHERE status = 'adoptable' AND is_canonical = true;

CREATE INDEX IF NOT EXISTS idx_animals_intake_date    ON public.animals (intake_date);
CREATE INDEX IF NOT EXISTS idx_animals_species_status ON public.animals (species, status);
CREATE INDEX IF NOT EXISTS idx_animals_state          ON public.animals (location_state);
CREATE INDEX IF NOT EXISTS idx_animals_org            ON public.animals (organization_id);
CREATE INDEX IF NOT EXISTS idx_animals_status         ON public.animals (status);
CREATE INDEX IF NOT EXISTS idx_animals_canonical      ON public.animals (canonical_id);
CREATE INDEX IF NOT EXISTS idx_animals_geog           ON public.animals USING gist (geog) WHERE geog IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_ein      ON public.organizations (ein);
CREATE INDEX IF NOT EXISTS idx_organizations_state    ON public.organizations (state);

CREATE INDEX IF NOT EXISTS idx_api_keys_org           ON public.api_keys (organization_id);
-- key_prefix already has a UNIQUE index from its column constraint.

CREATE INDEX IF NOT EXISTS idx_status_history_animal    ON public.status_history (animal_id);
CREATE INDEX IF NOT EXISTS idx_status_history_effective ON public.status_history (effective_at);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_org         ON public.batch_jobs (organization_id);

CREATE INDEX IF NOT EXISTS idx_photo_uploads_animal   ON public.photo_uploads (animal_id);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_org      ON public.photo_uploads (organization_id);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_phash    ON public.photo_uploads (perceptual_hash);

-- ----------------------------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- (1) updated_at maintenance ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_animals_updated_at ON public.animals;
CREATE TRIGGER trg_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_batch_jobs_updated_at ON public.batch_jobs;
CREATE TRIGGER trg_batch_jobs_updated_at
  BEFORE UPDATE ON public.batch_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- (2) geography point maintenance from lat/lng --------------------------------
CREATE OR REPLACE FUNCTION public.set_animal_geog()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_animals_geog ON public.animals;
CREATE TRIGGER trg_animals_geog
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.set_animal_geog();

-- (3) organizations.active_listings maintenance -------------------------------
-- "Active" = adoptable + canonical. Recomputed for the affected organization on
-- any relevant change; correct under status flips and (rare) org reassignment.
CREATE OR REPLACE FUNCTION public.refresh_active_listings()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_old_org uuid := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN OLD.organization_id END;
  v_new_org uuid := CASE WHEN TG_OP IN ('UPDATE','INSERT') THEN NEW.organization_id END;
BEGIN
  IF v_new_org IS NOT NULL THEN
    UPDATE public.organizations o
       SET active_listings = (
         SELECT count(*) FROM public.animals a
          WHERE a.organization_id = v_new_org
            AND a.status = 'adoptable'
            AND a.is_canonical = true
       )
     WHERE o.id = v_new_org;
  END IF;

  IF v_old_org IS NOT NULL AND v_old_org IS DISTINCT FROM v_new_org THEN
    UPDATE public.organizations o
       SET active_listings = (
         SELECT count(*) FROM public.animals a
          WHERE a.organization_id = v_old_org
            AND a.status = 'adoptable'
            AND a.is_canonical = true
       )
     WHERE o.id = v_old_org;
  END IF;

  RETURN NULL;  -- AFTER trigger; return value ignored
END;
$$;

DROP TRIGGER IF EXISTS trg_animals_active_listings ON public.animals;
CREATE TRIGGER trg_animals_active_listings
  AFTER INSERT OR DELETE OR UPDATE OF status, is_canonical, organization_id ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.refresh_active_listings();

-- ----------------------------------------------------------------------------
-- PUBLIC-FACING VIEWS  (consumed by the public Read API)
-- ----------------------------------------------------------------------------

-- Adoptable + pending dogs, with live days-waiting and safe shelter fields.
-- security_invoker = true so the querying role's RLS and column grants apply.
CREATE OR REPLACE VIEW public.dog_listings
WITH (security_invoker = true) AS
SELECT
  a.id,
  a.name,
  a.species,
  a.species_detail,
  a.intake_date,
  (CURRENT_DATE - a.intake_date)::int AS days_waiting,
  a.intake_type,
  a.sex,
  a.altered,
  a.size,
  a.primary_breed,
  a.secondary_breed,
  a.is_mixed,
  a.primary_color,
  a.coat_length,
  a.age_months,
  a.sac_age_group,
  a.weight_kg,
  a.description,
  a.adoption_fee,
  a.adoption_fee_currency,
  a.special_needs,
  a.good_with_dogs,
  a.good_with_cats,
  a.good_with_kids,
  a.photo_urls,
  a.primary_photo_url,
  a.listing_url,
  a.status,
  a.location_postal_code,
  a.location_city,
  a.location_state,
  a.location_country,
  a.location_lat,
  a.location_lng,
  a.geog,
  a.first_listed_at,
  a.organization_id,
  o.legal_name        AS org_legal_name,
  o.org_type          AS org_type,
  o.verification_tier AS org_verification_tier,
  o.city              AS org_city,
  o.state             AS org_state,
  o.country           AS org_country,
  o.website           AS org_website
FROM public.animals a
JOIN public.organizations o ON o.id = a.organization_id
WHERE a.species = 'dog'
  AND a.is_canonical = true
  AND a.status IN ('adoptable','pending');

-- Public shelter profile (safe columns only).
CREATE OR REPLACE VIEW public.shelters_public
WITH (security_invoker = true) AS
SELECT
  o.id,
  o.legal_name,
  o.org_type,
  o.verification_tier,
  o.city,
  o.state,
  o.country,
  o.website,
  o.active_listings,
  o.created_at
FROM public.organizations o;

-- Platform statistics. SECURITY DEFINER so it can read status_history (which is
-- not public) to count adoptions accurately; it returns aggregates only.
CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS TABLE (
  total_dogs           bigint,
  total_shelters       bigint,
  adoptions_this_month bigint,
  avg_wait_days        numeric,
  longest_wait_days    integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    (SELECT count(*) FROM public.animals
       WHERE species = 'dog' AND is_canonical = true AND status = 'adoptable'),
    (SELECT count(*) FROM public.organizations WHERE active_listings > 0),
    (SELECT count(*) FROM public.status_history
       WHERE new_status = 'adopted'
         AND effective_at >= date_trunc('month', now())),
    (SELECT round(avg(CURRENT_DATE - intake_date), 1) FROM public.animals
       WHERE species = 'dog' AND is_canonical = true AND status = 'adoptable'),
    (SELECT max(CURRENT_DATE - intake_date)::int FROM public.animals
       WHERE species = 'dog' AND is_canonical = true AND status = 'adoptable');
$$;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_uploads  ENABLE ROW LEVEL SECURITY;

-- Public read of organizations (column exposure is restricted by GRANTs below).
DROP POLICY IF EXISTS organizations_public_select ON public.organizations;
CREATE POLICY organizations_public_select
  ON public.organizations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read of canonical, non-removed animals.
DROP POLICY IF EXISTS animals_public_select ON public.animals;
CREATE POLICY animals_public_select
  ON public.animals FOR SELECT
  TO anon, authenticated
  USING (is_canonical = true AND status <> 'removed');

-- api_keys, status_history, batch_jobs, photo_uploads: no public policies, so
-- public roles are denied all access by RLS. The backend uses service_role,
-- which bypasses RLS.

-- ----------------------------------------------------------------------------
-- GRANTS
-- ----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Service role: full control everywhere (the backend write path).
GRANT ALL ON public.organizations  TO service_role;
GRANT ALL ON public.api_keys        TO service_role;
GRANT ALL ON public.animals         TO service_role;
GRANT ALL ON public.status_history  TO service_role;
GRANT ALL ON public.batch_jobs      TO service_role;
GRANT ALL ON public.photo_uploads   TO service_role;

-- Public roles: SELECT on animals (this table holds no PII).
GRANT SELECT ON public.animals TO anon, authenticated;

-- Public roles: SELECT only the NON-sensitive organization columns. ein,
-- contact_email, and contact_phone are deliberately excluded.
GRANT SELECT (
  id, legal_name, org_type, verification_tier, website,
  postal_code, city, state, country, active_listings, created_at, updated_at
) ON public.organizations TO anon, authenticated;

-- Public roles: the curated views and the stats function.
GRANT SELECT ON public.dog_listings    TO anon, authenticated;
GRANT SELECT ON public.shelters_public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated, service_role;

-- ============================================================================
-- End of 001_initial.sql
-- ============================================================================
