-- ============================================================================
-- WaitingTheLongest.com — Seed data
-- File: seed_data.sql
-- Run AFTER 001_initial.sql against the same database.
--
-- Contents: 8 organizations, 8 API keys, 50 dogs, and adoption history rows
-- for the dogs marked adopted (so /v1/public/stats reports a realistic
-- adoptions_this_month). intake_date values are expressed relative to
-- CURRENT_DATE so the days-waiting figures stay meaningful whenever you load
-- this. organizations.active_listings is maintained by the trigger in the
-- migration, so it is left at its default here and populated automatically as
-- the dogs are inserted.
--
-- Re-runnable: every INSERT uses ON CONFLICT DO NOTHING / NOT EXISTS guards.
-- ============================================================================

BEGIN;

-- ---- Organizations -------------------------------------------------------
INSERT INTO public.organizations
  (id, legal_name, ein, org_type, verification_tier, verification_method,
   rate_limit_per_hour, contact_email, contact_phone, website,
   postal_code, city, state, country)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Bay State Animal Care & Adoption Center', '04-3901234', 'municipal', 'tier_2_trusted', 'ein_pub78',
   5000, 'adopt@baystateanimalcare.org', '(617) 555-0142', 'https://baystateanimalcare.org', '02130', 'Boston', 'MA', 'US'),
  ('22222222-2222-2222-2222-222222222222', 'Lone Star Paws Rescue', '74-2810455', 'rescue', 'tier_1_verified', 'ein_pub78',
   1000, 'hello@lonestarpaws.org', '(512) 555-0198', 'https://lonestarpaws.org', '78704', 'Austin', 'TX', 'US'),
  ('33333333-3333-3333-3333-333333333333', 'Empire Humane Society', '16-1503782', 'humane_society', 'tier_2_trusted', 'ein_pub78',
   5000, 'info@empirehumane.org', '(716) 555-0177', 'https://empirehumane.org', '14201', 'Buffalo', 'NY', 'US'),
  ('44444444-4444-4444-4444-444444444444', 'Rocky Mountain Animal Friends', '84-2099166', 'foster_network', 'tier_1_verified', 'ein_pub78',
   1000, 'foster@rockymountainfriends.org', '(303) 555-0123', 'https://rockymountainfriends.org', '80205', 'Denver', 'CO', 'US'),
  ('55555555-5555-5555-5555-555555555555', 'Sunshine State SPCA', '59-3320781', 'spca', 'tier_1_verified', 'ein_pub78',
   1000, 'adopt@sunshinespca.org', '(407) 555-0156', 'https://sunshinespca.org', '32801', 'Orlando', 'FL', 'US'),
  ('66666666-6666-6666-6666-666666666666', 'Bayou Rescue Alliance', '72-1588990', 'rescue', 'tier_0_self_asserted', NULL,
   100, 'rescue@bayourescuealliance.org', '(504) 555-0188', 'https://bayourescuealliance.org', '70119', 'New Orleans', 'LA', 'US'),
  ('77777777-7777-7777-7777-777777777777', 'Cascade Paws Foster Network', '91-2076534', 'foster_network', 'tier_1_verified', 'ein_pub78',
   1000, 'team@cascadepaws.org', '(206) 555-0119', 'https://cascadepaws.org', '98122', 'Seattle', 'WA', 'US'),
  ('88888888-8888-8888-8888-888888888888', 'Heartland Animal Haven', '42-1690287', 'sanctuary', 'tier_0_self_asserted', NULL,
   100, 'haven@heartlandhaven.org', '(515) 555-0164', 'https://heartlandhaven.org', '50314', 'Des Moines', 'IA', 'US')
ON CONFLICT (id) DO NOTHING;

-- ---- API keys ------------------------------------------------------------
-- key_hash is a placeholder bcrypt-shaped string, NOT a real hash of the keys
-- below. The plaintext dev keys are recorded in the comments for testing; in
-- production the app stores only the bcrypt hash and never the plaintext.
-- wtl_1a2b3c4d_e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
-- wtl_2b3c4d5e_f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1
-- wtl_3c4d5e6f_a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
-- wtl_4d5e6f70_b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3
-- wtl_5e6f7081_c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4
-- wtl_6f708192_d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5
-- wtl_708192a3_e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6
-- wtl_8192a3b4_f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7
INSERT INTO public.api_keys
  (id, organization_id, key_hash, key_prefix, tier, label, is_active)
VALUES
  ('a1a1a1a1-0000-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_1a2b3c4d', 'tier_2_trusted', 'primary', true),
  ('a2a2a2a2-0000-4000-8000-000000000002', '22222222-2222-2222-2222-222222222222', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_2b3c4d5e', 'tier_1_verified', 'primary', true),
  ('a3a3a3a3-0000-4000-8000-000000000003', '33333333-3333-3333-3333-333333333333', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_3c4d5e6f', 'tier_2_trusted', 'primary', true),
  ('a4a4a4a4-0000-4000-8000-000000000004', '44444444-4444-4444-4444-444444444444', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_4d5e6f70', 'tier_1_verified', 'primary', true),
  ('a5a5a5a5-0000-4000-8000-000000000005', '55555555-5555-5555-5555-555555555555', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_5e6f7081', 'tier_1_verified', 'primary', true),
  ('a6a6a6a6-0000-4000-8000-000000000006', '66666666-6666-6666-6666-666666666666', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_6f708192', 'tier_0_self_asserted', 'primary', true),
  ('a7a7a7a7-0000-4000-8000-000000000007', '77777777-7777-7777-7777-777777777777', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_708192a3', 'tier_1_verified', 'primary', true),
  ('a8a8a8a8-0000-4000-8000-000000000008', '88888888-8888-8888-8888-888888888888', '$2b$12$C6UzMDM.H6dfI/f/IKcEeOabcdefghijklmnopqrstuvwxyz12', 'wtl_8192a3b4', 'tier_0_self_asserted', 'primary', true)
ON CONFLICT (id) DO NOTHING;

-- ---- Animals (50 dogs) ---------------------------------------------------
-- Bay State Animal Care & Adoption Center (Boston, MA) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0001', 'Biscuit', 'dog', CURRENT_DATE - 512, 'relinquished_by_owner',
   'male', 'altered', 'large', 'Labrador Retriever', 'Mixed Breed', true,
   'Yellow', 'short', 96, 'adult', 32.0,
   'Biscuit came to us when his family moved overseas and couldn''t take him along. He''s a gentle senior who still thinks he''s a puppy at heart, and he loves tennis balls, slow morning walks, and falling asleep with his head in your lap.', 150.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bsac-0001-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0001-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0001', 'adoptable',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.95, now(), (CURRENT_DATE - 512)::timestamptz),
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0002', 'Nova', 'dog', CURRENT_DATE - 128, 'stray_at_large',
   'female', 'altered', 'large', 'German Shepherd Dog', NULL, false,
   'Black and Tan', 'medium', 36, 'adult', 28.0,
   'Nova is whip-smart and desperate to please. She already knows sit, down, and shake, and she''d thrive with someone who wants a hiking partner and a study buddy rolled into one.', 200.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bsac-0002-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0002-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0002', 'adoptable',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 128)::timestamptz),
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0003', 'Tank', 'dog', CURRENT_DATE - 952, 'relinquished_by_owner',
   'male', 'altered', 'medium', 'American Staffordshire Terrier', 'Mixed Breed', true,
   'Brindle', 'short', 60, 'adult', 26.0,
   'Tank has waited longer than any dog should have to, mostly because people judge his blocky head before they meet his marshmallow heart. He walks like a gentleman on leash and gives the world''s most enthusiastic morning greetings. He just wants a couch and a person to call his own.', 95.00, 'no', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bsac-0003-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0003-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0003', 'adoptable',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.85, now(), (CURRENT_DATE - 952)::timestamptz),
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0004', 'Pearl', 'dog', CURRENT_DATE - 66, 'transfer_in_in_state',
   'female', 'altered', 'small', 'Beagle', NULL, false,
   'Tricolor', 'short', 24, 'adult', 11.0,
   'Pearl is a pocket-sized bundle of nose and joy. True to her breed she''ll follow a scent to the ends of the earth, then trot back for belly rubs. She gets along with absolutely everyone.', 175.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bsac-0004-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0004-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0004', 'adopted',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 66)::timestamptz),
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0005', 'Moose', 'dog', CURRENT_DATE - 222, 'stray_at_large',
   'male', 'intact', 'xlarge', 'Great Dane', 'Mixed Breed', true,
   'Harlequin', 'short', 18, 'adult', 54.0,
   'Moose is a year and a half of legs, slobber, and love who hasn''t quite realized he''s the size of a pony. He needs a patient adopter for some manners work and a home without toddlers he could accidentally bowl over. He leans in for hugs like it''s his job.', 250.00, 'yes', 'unknown', 'no',
   false, ARRAY['https://images.waitingthelongest.com/seed/bsac-0005-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0005-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0005', 'adoptable',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.85, now(), (CURRENT_DATE - 222)::timestamptz),
  ('11111111-1111-1111-1111-111111111111', 'BSAC-0006', 'Clementine', 'dog', CURRENT_DATE - 415, 'relinquished_by_owner',
   'female', 'altered', 'small', 'Dachshund', NULL, false,
   'Red', 'short', 132, 'adult', 6.0,
   'Clementine is a silver-muzzled little lady who lost her person to a nursing home. She has a mild heart murmur we manage with daily medication, and she asks only for a warm blanket, a sunny windowsill, and someone to grow old alongside. Her adoption fee is reduced through our Silver Paws program.', 50.00, 'unknown', 'yes', 'no',
   true, ARRAY['https://images.waitingthelongest.com/seed/bsac-0006-1.jpg', 'https://images.waitingthelongest.com/seed/bsac-0006-2.jpg']::text[], 'https://baystateanimalcare.org/adopt/BSAC-0006', 'adoptable',
   '02130', 'Boston', 'MA', 42.309800, -71.115100,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 415)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Lone Star Paws Rescue (Austin, TX) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'LSP-1001', 'Willie', 'dog', CURRENT_DATE - 611, 'stray_at_large',
   'male', 'altered', 'large', 'Catahoula Leopard Dog', 'Mixed Breed', true,
   'Blue Merle', 'short', 48, 'adult', 25.0,
   'Willie is a true Texas Catahoula: striking eyes, endless energy, and a work ethic that won''t quit. He''d love a job, whether that''s agility, trail running, or just being your most loyal ranch hand. He''s crate-trained and house-trained.', 150.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1001-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1001-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1001', 'adoptable',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 611)::timestamptz),
  ('22222222-2222-2222-2222-222222222222', 'LSP-1002', 'Daisy Mae', 'dog', CURRENT_DATE - 140, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Australian Cattle Dog', NULL, false,
   'Blue Speckled', 'short', 30, 'adult', 18.0,
   'Daisy Mae is clever, busy, and utterly devoted to her people. Like most heelers she likes to keep her family together and her toys in a neat pile. An active home please, with a yard and a job to do.', 175.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1002-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1002-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1002', 'adoptable',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 140)::timestamptz),
  ('22222222-2222-2222-2222-222222222222', 'LSP-1003', 'Cooper', 'dog', CURRENT_DATE - 38, 'born_in_care',
   'male', 'altered', 'large', 'Labrador Retriever', NULL, false,
   'Chocolate', 'short', 8, 'adult', 22.0,
   'Cooper is a chocolate Lab puppy with all the charm and, for now, none of the manners. He''s a quick study who has already mastered ''sit'' for a treat, and he''ll grow into a big, goofy, devoted best friend.', 250.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1003-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1003-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1003', 'pending',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.95, now(), (CURRENT_DATE - 38)::timestamptz),
  ('22222222-2222-2222-2222-222222222222', 'LSP-1004', 'Rosie', 'dog', CURRENT_DATE - 534, 'stray_at_large',
   'female', 'altered', 'small', 'Chihuahua', 'Mixed Breed', true,
   'Fawn', 'short', 84, 'adult', 4.0,
   'Rosie is a tiny diva with a big opinion and an even bigger heart, once she trusts you. She arrived as a stray and has blossomed with patient volunteers. She''d do best in a quiet adult home as the one and only.', 95.00, 'no', 'unknown', 'no',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1004-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1004-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1004', 'adoptable',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.80, now(), (CURRENT_DATE - 534)::timestamptz),
  ('22222222-2222-2222-2222-222222222222', 'LSP-1005', 'Bear', 'dog', CURRENT_DATE - 300, 'transfer_in_out_of_state',
   'male', 'intact', 'xlarge', 'Great Pyrenees', 'Mixed Breed', true,
   'White', 'long', 26, 'adult', 48.0,
   'Bear is a gentle giant with a cloud-white coat and the calm, watchful soul of a livestock guardian. He''s wonderful with kids, cats, and other dogs, and he''d love a home with room to patrol and a family to adore.', 200.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1005-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1005-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1005', 'adoptable',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 300)::timestamptz),
  ('22222222-2222-2222-2222-222222222222', 'LSP-1006', 'Scout', 'dog', CURRENT_DATE - 712, 'stray_at_large',
   'male', 'altered', 'medium', 'Beagle', 'Hound', true,
   'Tricolor', 'short', 56, 'adult', 16.0,
   'Scout has one of the longest waits in our rescue and we honestly can''t explain it. He''s friendly with absolutely everyone, travels beautifully, and sings the sweetest hound song you''ve ever heard. Please don''t overlook this patient, perfect boy.', 150.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/lsp-1006-1.jpg', 'https://images.waitingthelongest.com/seed/lsp-1006-2.jpg']::text[], 'https://lonestarpaws.org/adopt/LSP-1006', 'adoptable',
   '78704', 'Austin', 'TX', 30.245100, -97.768800,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 712)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Empire Humane Society (Buffalo, NY) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'EHS-2001', 'Luna', 'dog', CURRENT_DATE - 96, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Siberian Husky', NULL, false,
   'Gray and White', 'medium', 22, 'adult', 20.0,
   'Luna is a talkative, blue-eyed beauty with energy to spare and a genuine escape-artist streak. She needs a secure fenced yard and an adventurous family who''ll match her enthusiasm for the outdoors. Never a dull moment with this one.', 225.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ehs-2001-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2001-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2001', 'adoptable',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 96)::timestamptz),
  ('33333333-3333-3333-3333-333333333333', 'EHS-2002', 'Gus', 'dog', CURRENT_DATE - 348, 'relinquished_by_owner',
   'male', 'altered', 'large', 'Boxer', NULL, false,
   'Fawn', 'short', 72, 'adult', 30.0,
   'Gus is a wiggly, full-body-wag kind of guy who never met a lap he didn''t want to sit in. At six he''s well past the wild puppy stage and ready to be your devoted shadow. He knows his basic commands and lives for car rides.', 175.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ehs-2002-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2002-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2002', 'adoptable',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 348)::timestamptz),
  ('33333333-3333-3333-3333-333333333333', 'EHS-2003', 'Maple', 'dog', CURRENT_DATE - 180, 'transfer_in_in_state',
   'female', 'altered', 'medium', 'Border Collie', 'Mixed Breed', true,
   'Black and White', 'medium', 40, 'adult', 17.0,
   'Maple is brilliant, maybe even a little too brilliant. She learns new tricks in minutes and needs a real brain-and-body job to match. Agility, flyball, or a hobby farm would suit her perfectly, and she''ll reward you by becoming your velcro shadow.', 200.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ehs-2003-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2003-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2003', 'adopted',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 180)::timestamptz),
  ('33333333-3333-3333-3333-333333333333', 'EHS-2004', 'Winston', 'dog', CURRENT_DATE - 255, 'owner_intended_euthanasia',
   'male', 'altered', 'medium', 'Bulldog', NULL, false,
   'White and Brindle', 'short', 60, 'adult', 22.0,
   'Winston is a snorting, snuffling charmer who was surrendered when his medical needs grew. He has managed skin allergies and asks for a patient home and a comfy bed away from the stairs. In return you get the most loyal, comical companion imaginable.', 300.00, 'unknown', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/ehs-2004-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2004-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2004', 'adoptable',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.85, now(), (CURRENT_DATE - 255)::timestamptz),
  ('33333333-3333-3333-3333-333333333333', 'EHS-2005', 'Sadie', 'dog', CURRENT_DATE - 640, 'stray_at_large',
   'female', 'altered', 'large', 'German Shepherd Dog', 'Mixed Breed', true,
   'Sable', 'medium', 108, 'adult', 27.0,
   'Sadie is a dignified senior shepherd who has watched hundreds of younger dogs get adopted before her. She''s calm, house-trained, and content with gentle walks and quiet evenings. She has so much love left to give; please don''t let her spend her golden years in a kennel.', 95.00, 'unknown', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ehs-2005-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2005-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2005', 'adoptable',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.85, now(), (CURRENT_DATE - 640)::timestamptz),
  ('33333333-3333-3333-3333-333333333333', 'EHS-2006', 'Pippin', 'dog', CURRENT_DATE - 72, 'relinquished_by_owner',
   'male', 'altered', 'small', 'Jack Russell Terrier', NULL, false,
   'White and Tan', 'short', 28, 'adult', 7.0,
   'Pippin is pure terrier: spunky, fearless, and always up for a game. He''ll keep you laughing and on your toes in equal measure. He''s best with an active family who can give him plenty of exercise and a few puzzle toys to outwit.', 150.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ehs-2006-1.jpg', 'https://images.waitingthelongest.com/seed/ehs-2006-2.jpg']::text[], 'https://empirehumane.org/adopt/EHS-2006', 'adoptable',
   '14201', 'Buffalo', 'NY', 42.892500, -78.879400,
   'tier_2_trusted', 0.90, now(), (CURRENT_DATE - 72)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Rocky Mountain Animal Friends (Denver, CO) — 7 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'RMF-3001', 'Aspen', 'dog', CURRENT_DATE - 150, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Australian Shepherd', NULL, false,
   'Blue Merle', 'long', 34, 'adult', 19.0,
   'Aspen is a stunning merle Aussie with eyes that melt hearts and a mind that never stops. She''s in a foster home learning to settle, and she''d love an active Colorado family for hikes, frisbee, and well-earned snuggles after.', 250.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/rmf-3001-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3001-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3001', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 150)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3002', 'Diesel', 'dog', CURRENT_DATE - 420, 'stray_at_large',
   'male', 'altered', 'large', 'Rottweiler', NULL, false,
   'Black and Rust', 'short', 50, 'adult', 45.0,
   'Diesel is a big, blocky teddy bear who leans his whole weight against you when he wants love. He''s a confident dog who''ll do best with an experienced owner and as the only pet. He''s loyal to the moon and back.', 200.00, 'no', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/rmf-3002-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3002-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3002', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 420)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3003', 'Penny', 'dog', CURRENT_DATE - 388, 'relinquished_by_owner',
   'female', 'altered', 'small', 'Dachshund', 'Mixed Breed', true,
   'Black and Tan', 'short', 96, 'adult', 6.0,
   'Penny is a sweet senior doxie who manages a back condition with a ramp and a careful routine. She''s low-key, lap-loving, and asks for a calm home without stairs to jump. She''s a gentle soul who has earned a little comfort.', 95.00, 'yes', 'yes', 'unknown',
   true, ARRAY['https://images.waitingthelongest.com/seed/rmf-3003-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3003-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3003', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 388)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3004', 'Ranger', 'dog', CURRENT_DATE - 88, 'transfer_in_out_of_state',
   'male', 'altered', 'large', 'Pointer', 'Labrador Retriever', true,
   'Liver and White', 'short', 16, 'adult', 24.0,
   'Ranger is a leggy young bird-dog mix with boundless energy and a heart of gold. He''s still learning his leash manners but tries so hard to please. Give him a trail, a tennis ball, and a job, and he''s yours forever.', 175.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/rmf-3004-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3004-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3004', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 88)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3005', 'Olive', 'dog', CURRENT_DATE - 205, 'owner_intended_euthanasia',
   'female', 'altered', 'small', 'Pug', NULL, false,
   'Fawn', 'short', 78, 'adult', 8.0,
   'Olive is a wheezy, wonderful little potato of a dog who came to us when her owner could no longer afford her eye care. She''s had treatment and now just needs daily eye drops and a lap to call home. Snorts, snuggles, and unconditional love are guaranteed.', 200.00, 'yes', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/rmf-3005-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3005-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3005', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 205)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3006', 'Koda', 'dog', CURRENT_DATE - 560, 'stray_at_large',
   'male', 'intact', 'xlarge', 'Alaskan Malamute', 'Mixed Breed', true,
   'Gray and White', 'long', 30, 'adult', 40.0,
   'Koda is a magnificent, fluffy mountain of a dog who''s been waiting nearly two years for someone to see past his size. He''s gentle, social, and head-over-heels for snow. He needs regular grooming, real exercise, and a family ready for a whole lot of dog to love.', 250.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/rmf-3006-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3006-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3006', 'adoptable',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 560)::timestamptz),
  ('44444444-4444-4444-4444-444444444444', 'RMF-3007', 'Birdie', 'dog', CURRENT_DATE - 30, 'born_in_care',
   'female', 'altered', 'small', 'Terrier', 'Mixed Breed', true,
   'Wheaten', 'wire', 5, 'under_5_months', 5.0,
   'Birdie is a scruffy, soulful puppy with a wiry coat and a heart full of trust. Born in foster care, she''s known nothing but kindness, and she''s ready to pour every bit of it into her forever family.', 250.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/rmf-3007-1.jpg', 'https://images.waitingthelongest.com/seed/rmf-3007-2.jpg']::text[], 'https://rockymountainfriends.org/adopt/RMF-3007', 'pending',
   '80205', 'Denver', 'CO', 39.757000, -104.971200,
   'tier_1_verified', 0.95, now(), (CURRENT_DATE - 30)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Sunshine State SPCA (Orlando, FL) — 7 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('55555555-5555-5555-5555-555555555555', 'SSP-4001', 'Mango', 'dog', CURRENT_DATE - 175, 'relinquished_by_owner',
   'male', 'altered', 'large', 'Labrador Retriever', 'Mixed Breed', true,
   'Yellow', 'short', 44, 'adult', 30.0,
   'Mango is sunshine in dog form: golden, goofy, and good with absolutely everyone. He loves water, fetch, and making new friends at the park. He''s the ultimate family dog, just waiting for his people to find him.', 150.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4001-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4001-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4001', 'pending',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 175)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4002', 'Shadow', 'dog', CURRENT_DATE - 470, 'seized_custody',
   'male', 'altered', 'large', 'Belgian Malinois', 'Mixed Breed', true,
   'Fawn with Black Mask', 'short', 38, 'adult', 28.0,
   'Shadow is an intense, intelligent dog who came from a difficult situation and has worked hard to trust people again. He needs an experienced, active adult home with no other pets and someone who truly understands working breeds. For the right person, he is fiercely devoted.', 200.00, 'no', 'no', 'no',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4002-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4002-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4002', 'adoptable',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.80, now(), (CURRENT_DATE - 470)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4003', 'Lily', 'dog', CURRENT_DATE - 240, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Cocker Spaniel', NULL, false,
   'Buff', 'long', 64, 'adult', 13.0,
   'Lily is a soft, sweet spaniel with silky ears and a feather-duster tail that simply never stops wagging. She loves gentle grooming sessions and long afternoon naps. She''s a calm, affectionate companion for nearly any home.', 175.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4003-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4003-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4003', 'adoptable',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 240)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4004', 'Diego', 'dog', CURRENT_DATE - 505, 'stray_at_large',
   'male', 'altered', 'small', 'Chihuahua', 'Terrier', true,
   'Black and White', 'short', 60, 'adult', 5.0,
   'Diego is a dapper little gentleman in a tuxedo coat who took months to come out of his shell. Now he''s a total velcro lapdog who''d love a patient, quiet home where he can be your constant companion.', 95.00, 'unknown', 'yes', 'no',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4004-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4004-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4004', 'adoptable',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.80, now(), (CURRENT_DATE - 505)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4005', 'Honey', 'dog', CURRENT_DATE - 300, 'relinquished_by_owner',
   'female', 'altered', 'large', 'Golden Retriever', 'Mixed Breed', true,
   'Golden', 'medium', 120, 'adult', 28.0,
   'Honey is a classic golden girl, gray around the muzzle and gentle to the core. She has some arthritis we manage with supplements and short walks. She''s the kind of dog who rests her chin on your knee and looks at you like you hung the moon.', 95.00, 'yes', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/ssp-4005-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4005-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4005', 'adoptable',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 300)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4006', 'Rocky', 'dog', CURRENT_DATE - 655, 'owner_intended_euthanasia',
   'male', 'altered', 'large', 'American Bulldog', 'Mixed Breed', true,
   'White and Brindle', 'short', 42, 'adult', 34.0,
   'Rocky is a muscular charmer with a head like a cinder block and a temperament like a pillow. He''s been passed over again and again, yet everyone who actually meets him falls hard. He''d love to be your one-and-only, your gym buddy, and your nap buddy all at once.', 150.00, 'unknown', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4006-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4006-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4006', 'adoptable',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 655)::timestamptz),
  ('55555555-5555-5555-5555-555555555555', 'SSP-4007', 'Mia', 'dog', CURRENT_DATE - 58, 'transfer_in_in_state',
   'female', 'altered', 'small', 'Beagle', 'Mixed Breed', true,
   'Lemon and White', 'short', 14, 'adult', 10.0,
   'Mia is a young, bright-eyed beagle mix with a metronome tail and a curious nose. She''s playful with other dogs and gentle with children. A happy, easygoing girl who''s ready for her very first real home.', 175.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/ssp-4007-1.jpg', 'https://images.waitingthelongest.com/seed/ssp-4007-2.jpg']::text[], 'https://sunshinespca.org/adopt/SSP-4007', 'adopted',
   '32801', 'Orlando', 'FL', 28.542100, -81.379000,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 58)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Bayou Rescue Alliance (New Orleans, LA) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('66666666-6666-6666-6666-666666666666', 'BRA-5001', 'Gumbo', 'dog', CURRENT_DATE - 735, 'stray_at_large',
   'male', 'altered', 'large', 'Catahoula Leopard Dog', 'American Pit Bull Terrier', true,
   'Brindle Merle', 'short', 52, 'adult', 27.0,
   'Gumbo is a one-of-a-kind Louisiana mix with a marbled coat and a heart as big as the bayou. He''s been waiting over two years for someone to fall for his quirky looks and steadfast soul. He''s house-trained, dog-friendly, and endlessly grateful for any attention.', 100.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bra-5001-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5001-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5001', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 735)::timestamptz),
  ('66666666-6666-6666-6666-666666666666', 'BRA-5002', 'Beignet', 'dog', CURRENT_DATE - 110, 'born_in_care',
   'female', 'altered', 'small', 'Terrier', 'Mixed Breed', true,
   'Cream', 'medium', 18, 'adult', 6.0,
   'Beignet is as sweet as her name: a fluffy little powder-puff who greets every single day with a happy dance. She''s good with kids, cats, and dogs alike, and she''d fit into almost any loving home.', 150.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bra-5002-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5002-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5002', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.85, now(), (CURRENT_DATE - 110)::timestamptz),
  ('66666666-6666-6666-6666-666666666666', 'BRA-5003', 'Boudreaux', 'dog', CURRENT_DATE - 410, 'stray_at_large',
   'male', 'altered', 'large', 'Black and Tan Coonhound', NULL, false,
   'Black and Tan', 'short', 46, 'adult', 29.0,
   'Boudreaux is a classic coonhound with a velvet voice and a nose that runs the whole show. He''s mellow in the house and tireless on the trail. Give this handsome hound a scent to follow and a soft place to land at night.', 125.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bra-5003-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5003-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5003', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 410)::timestamptz),
  ('66666666-6666-6666-6666-666666666666', 'BRA-5004', 'Praline', 'dog', CURRENT_DATE - 300, 'owner_intended_euthanasia',
   'female', 'altered', 'medium', 'American Pit Bull Terrier', 'Mixed Breed', true,
   'Blue and White', 'short', 36, 'adult', 24.0,
   'Praline is a smiley, sweet-natured girl who adores people and leans in for hugs at every opportunity. She''d prefer to be your only pet so she can soak up all of the love. Don''t let breed labels fool you; she''s a total sweetheart.', 100.00, 'unknown', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bra-5004-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5004-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5004', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 300)::timestamptz),
  ('66666666-6666-6666-6666-666666666666', 'BRA-5005', 'Tujague', 'dog', CURRENT_DATE - 160, 'stray_at_large',
   'male', 'intact', 'large', 'Catahoula Leopard Dog', NULL, false,
   'Leopard', 'short', 24, 'adult', 26.0,
   'Tujague is a striking young Catahoula with glassy eyes and a playful streak a mile wide. He''s smart and athletic and needs an active home that will keep both his body and his brain busy. He''s a genuine head-turner on every walk.', 125.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/bra-5005-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5005-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5005', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 160)::timestamptz),
  ('66666666-6666-6666-6666-666666666666', 'BRA-5006', 'Magnolia', 'dog', CURRENT_DATE - 520, 'stray_at_large',
   'female', 'altered', 'medium', 'Hound', 'Mixed Breed', true,
   'Red and White', 'short', 90, 'adult', 18.0,
   'Magnolia is a soft-eyed Southern lady who came to us heartworm-positive and has since been fully treated and cleared. She''s gentle, quiet, and good with everyone she meets. After everything she''s been through, she just wants a porch and a person of her own.', 95.00, 'yes', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/bra-5006-1.jpg', 'https://images.waitingthelongest.com/seed/bra-5006-2.jpg']::text[], 'https://bayourescuealliance.org/adopt/BRA-5006', 'adoptable',
   '70119', 'New Orleans', 'LA', 29.972800, -90.089000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 520)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Cascade Paws Foster Network (Seattle, WA) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'CPF-6001', 'Juniper', 'dog', CURRENT_DATE - 130, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Australian Shepherd', 'Border Collie', true,
   'Red Merle', 'long', 28, 'adult', 18.0,
   'Juniper is a brainy, beautiful herding mix who lives for a job and a flying frisbee. She''s in foster learning her manners and would thrive with an active Pacific Northwest family who loves the trails as much as she does.', 250.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6001-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6001-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6001', 'adoptable',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 130)::timestamptz),
  ('77777777-7777-7777-7777-777777777777', 'CPF-6002', 'Salmon', 'dog', CURRENT_DATE - 210, 'relinquished_by_owner',
   'male', 'altered', 'large', 'Labrador Retriever', NULL, false,
   'Black', 'short', 54, 'adult', 31.0,
   'Salmon is a classic black Lab who loves exactly three things: water, food, and you, not necessarily in that order. He''s mellow, friendly, and the very definition of an easy dog. He''d be perfect for a first-time owner or a busy family.', 175.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6002-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6002-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6002', 'pending',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 210)::timestamptz),
  ('77777777-7777-7777-7777-777777777777', 'CPF-6003', 'Fern', 'dog', CURRENT_DATE - 64, 'transfer_in_out_of_state',
   'female', 'altered', 'large', 'Shepherd', 'Mixed Breed', true,
   'Black and Tan', 'medium', 12, 'adult', 21.0,
   'Fern is a soulful young shepherd mix with one floppy ear and a heart full of hope. She''s a little shy at first but blossoms into a playful, devoted companion. She''d love a patient family to grow up alongside.', 200.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6003-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6003-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6003', 'adopted',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 64)::timestamptz),
  ('77777777-7777-7777-7777-777777777777', 'CPF-6004', 'Moss', 'dog', CURRENT_DATE - 175, 'relinquished_by_owner',
   'male', 'altered', 'small', 'Cardigan Welsh Corgi', 'Mixed Breed', true,
   'Merle', 'medium', 40, 'adult', 13.0,
   'Moss is a long-and-low charmer with a fox face and a big-dog attitude packed into a small-dog body. He''s funny, deeply food-motivated, and surprisingly athletic. He''s a delightful companion who''ll keep you smiling daily.', 250.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6004-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6004-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6004', 'adoptable',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.90, now(), (CURRENT_DATE - 175)::timestamptz),
  ('77777777-7777-7777-7777-777777777777', 'CPF-6005', 'Cedar', 'dog', CURRENT_DATE - 470, 'stray_at_large',
   'male', 'intact', 'large', 'Siberian Husky', 'Shepherd', true,
   'Agouti', 'medium', 22, 'adult', 27.0,
   'Cedar is a wild-and-wonderful husky mix with the looks of a wolf and the heart of a goofball. He needs a secure yard, lots of exercise, and an adventurous human. He''ll repay you with fierce loyalty and the occasional dramatic howl.', 200.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6005-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6005-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6005', 'adoptable',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 470)::timestamptz),
  ('77777777-7777-7777-7777-777777777777', 'CPF-6006', 'Willow', 'dog', CURRENT_DATE - 640, 'transfer_in_out_of_state',
   'female', 'altered', 'large', 'Greyhound', NULL, false,
   'Blue Brindle', 'short', 84, 'adult', 27.0,
   'Willow is a retired racer with the elegance of a statue and the soul of a couch potato. She''s been overlooked for far too long. She offers forty-five-mile-an-hour naps, impeccably gentle manners, and quiet, total devotion.', 200.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/cpf-6006-1.jpg', 'https://images.waitingthelongest.com/seed/cpf-6006-2.jpg']::text[], 'https://cascadepaws.org/adopt/CPF-6006', 'adoptable',
   '98122', 'Seattle', 'WA', 47.614200, -122.303500,
   'tier_1_verified', 0.85, now(), (CURRENT_DATE - 640)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- Heartland Animal Haven (Des Moines, IA) — 6 dogs
INSERT INTO public.animals
  (organization_id, external_id, name, species, intake_date, intake_type,
   sex, altered, size, primary_breed, secondary_breed, is_mixed,
   primary_color, coat_length, age_months, sac_age_group, weight_kg,
   description, adoption_fee, good_with_dogs, good_with_cats, good_with_kids,
   special_needs, photo_urls, listing_url, status,
   location_postal_code, location_city, location_state, location_lat, location_lng,
   submitter_verification_tier, confidence_score, submitted_at, first_listed_at)
VALUES
  ('88888888-8888-8888-8888-888888888888', 'HAH-7001', 'Duke', 'dog', CURRENT_DATE - 300, 'relinquished_by_owner',
   'male', 'altered', 'xlarge', 'Mastiff', 'Mixed Breed', true,
   'Fawn', 'short', 66, 'adult', 60.0,
   'Duke is a gentle behemoth who is firmly convinced he''s a lapdog and acts accordingly. He''s calm, sweet, and wonderful with kids and other animals. You''ll need room for his big body and his even bigger heart, plus a towel for the drool.', 150.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/hah-7001-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7001-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7001', 'adoptable',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.85, now(), (CURRENT_DATE - 300)::timestamptz),
  ('88888888-8888-8888-8888-888888888888', 'HAH-7002', 'Hazel', 'dog', CURRENT_DATE - 455, 'relinquished_by_owner',
   'female', 'altered', 'medium', 'Beagle', 'Basset Hound', true,
   'Tricolor', 'short', 102, 'adult', 16.0,
   'Hazel is a low-rider hound with soulful eyes and a few extra pounds we''re gently helping her shed. She loves snuffle mats, slow strolls, and snacks (in strict moderation now). She''s a mellow, affectionate girl looking for a patient, loving home.', 95.00, 'yes', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/hah-7002-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7002-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7002', 'adoptable',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.85, now(), (CURRENT_DATE - 455)::timestamptz),
  ('88888888-8888-8888-8888-888888888888', 'HAH-7003', 'Ziggy', 'dog', CURRENT_DATE - 95, 'stray_at_large',
   'male', 'altered', 'medium', 'Border Collie', 'Mixed Breed', true,
   'Black and White', 'medium', 20, 'adult', 17.0,
   'Ziggy is a zoomie-powered young collie mix with a brain that demands a job and a body that demands a run. He''s eager, affectionate, and so smart it''s almost spooky. Active home with a training plan, please!', 175.00, 'yes', 'unknown', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/hah-7003-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7003-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7003', 'adoptable',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.85, now(), (CURRENT_DATE - 95)::timestamptz),
  ('88888888-8888-8888-8888-888888888888', 'HAH-7004', 'Maybelle', 'dog', CURRENT_DATE - 700, 'stray_at_large',
   'female', 'altered', 'large', 'Treeing Walker Coonhound', NULL, false,
   'Tricolor', 'short', 58, 'adult', 23.0,
   'Maybelle is a long-eared songstress who''s been waiting nearly two years for her person to show up. She''s friendly, easygoing, and great with other dogs. If you''ve got a fenced yard and a fondness for the occasional aria, she''s your girl.', 95.00, 'yes', 'no', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/hah-7004-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7004-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7004', 'adoptable',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.80, now(), (CURRENT_DATE - 700)::timestamptz),
  ('88888888-8888-8888-8888-888888888888', 'HAH-7005', 'Tucker', 'dog', CURRENT_DATE - 380, 'owner_intended_euthanasia',
   'male', 'altered', 'large', 'Labrador Retriever', 'Hound', true,
   'Black and Tan', 'short', 132, 'adult', 29.0,
   'Tucker is a wise old gentleman who was surrendered at eleven when his family said they no longer had time for him. He has a few harmless fatty lumps and a whole lot of love left. He''s house-trained, easygoing, and dreams of a soft bed and a quiet retirement. His senior adoption fee is reduced.', 50.00, 'yes', 'yes', 'yes',
   true, ARRAY['https://images.waitingthelongest.com/seed/hah-7005-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7005-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7005', 'adoptable',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.85, now(), (CURRENT_DATE - 380)::timestamptz),
  ('88888888-8888-8888-8888-888888888888', 'HAH-7006', 'Clover', 'dog', CURRENT_DATE - 33, 'born_in_care',
   'female', 'altered', 'medium', 'Shepherd', 'Australian Cattle Dog', true,
   'Brindle', 'short', 4, 'under_5_months', 7.0,
   'Clover is a wide-eyed puppy with brindle stripes and a belly that always wants rubbing. Born in our care, she''s curious, cuddly, and ready to discover the whole wide world with a family of her own.', 250.00, 'yes', 'yes', 'yes',
   false, ARRAY['https://images.waitingthelongest.com/seed/hah-7006-1.jpg', 'https://images.waitingthelongest.com/seed/hah-7006-2.jpg']::text[], 'https://heartlandhaven.org/adopt/HAH-7006', 'adopted',
   '50314', 'Des Moines', 'IA', 41.599400, -93.625000,
   'tier_0_self_asserted', 0.95, now(), (CURRENT_DATE - 33)::timestamptz)
ON CONFLICT (organization_id, external_id) DO NOTHING;

-- ---- Adoption history ----------------------------------------------------
-- One 'adopted' transition per adopted dog, effective now() so it falls in the
-- current month and is counted by platform_stats().adoptions_this_month.
INSERT INTO public.status_history (animal_id, old_status, new_status, outcome_type, effective_at)
SELECT a.id, 'adoptable', 'adopted', 'adoption', now()
FROM public.animals a
WHERE (a.organization_id, a.external_id) IN (('11111111-1111-1111-1111-111111111111', 'BSAC-0004'), ('33333333-3333-3333-3333-333333333333', 'EHS-2003'), ('55555555-5555-5555-5555-555555555555', 'SSP-4007'), ('77777777-7777-7777-7777-777777777777', 'CPF-6003'), ('88888888-8888-8888-8888-888888888888', 'HAH-7006'))
  AND NOT EXISTS (
    SELECT 1 FROM public.status_history h
    WHERE h.animal_id = a.id AND h.new_status = 'adopted'
  );

COMMIT;

-- ============================================================================
-- End of seed_data.sql  (8 orgs, 8 keys, 50 dogs, 5 adoption events)
-- ============================================================================
