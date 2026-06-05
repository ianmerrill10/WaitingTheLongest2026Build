# SAC Vocabulary Mapping
### WaitingTheLongest Intake API → Shelter Animals Count (IOD)

This document records how the intake API's controlled vocabularies map to the
Shelter Animals Count (SAC) Intake & Outcome Database, and — just as important —
how confident we are in each value. The point of aligning to SAC is that the
field that powers the whole platform, `intake_date`, and the categories around
it should mean exactly what shelters already record, rather than what we made up.
SAC's framework was built with the major welfare organizations (ASPCA, Maddie's
Fund, HSUS, PetSmart Charities, American Humane, UC Davis, and others), which is
why aligning to it is both an accuracy decision and a credibility one.

A standing caution, since data accuracy is the priority here: SAC's IOD is
designed for *aggregate* monthly intake and outcome counts, not for individual
adoptable-animal listings. We are therefore borrowing its controlled
vocabularies and its definitions for the handful of fields it covers, and
wrapping them inside our own per-animal listing schema. We are not adopting it
wholesale, and we should not imply to shelters that we are.

## Source documents

The mapping below is drawn from SAC's published materials. Before v1.0 is
frozen, the enumerated lists marked "to confirm" must be reconciled against the
current official IOD matrix, because the exact category names and groupings have
been revised over the program's history.

- SAC data standardization overview: https://www.shelteranimalscount.org/data-standardization-resources/
- SAC "What animals are counted" / IOD matrix (PDF): https://www.shelteranimalscount.org/wp-content/uploads/2022/05/IntakeandOutcomeDatabaseIOD_SAC.pdf
- SAC basic data matrix definitions (PDF): https://www.shelteranimalscount.org/wp-content/uploads/2022/02/BasicDataMatrix_SAC.pdf

## Verification legend

**Confirmed** — the category and its definition appear in SAC's published
matrix and the mapping is a faithful paraphrase.

**To confirm** — the value follows the standard SAC/Asilomar framework and is
almost certainly correct, but was not directly verified against the current
official document and must be checked before the vocabulary is frozen.

---

## Species

SAC's IOD spans a defined set of species categories: cats, dogs, rabbits,
equines, small mammals, birds, reptiles and amphibians, and farm animals. Our
`species` enum maps one-to-one onto those, plus an explicit `other` catch-all
that requires `species_detail` so nothing is silently miscategorized.

| API value (`species`) | SAC category | Status |
| --- | --- | --- |
| `dog` | Dogs | Confirmed |
| `cat` | Cats | Confirmed |
| `rabbit` | Rabbits | Confirmed |
| `equine` | Equines | Confirmed |
| `small_mammal` | Small mammals | Confirmed |
| `bird` | Birds | Confirmed |
| `reptile_amphibian` | Reptiles and amphibians | Confirmed |
| `farm_animal` | Farm animals | Confirmed |
| `other` | (no SAC equivalent) | WTL extension; requires `species_detail` |

---

## Intake types

`intake_type` maps to SAC's live-intake categories. The first four are confirmed
against SAC's published definitions; the remainder follow the standard framework
and are flagged for confirmation.

| API value (`intake_type`) | SAC category | Definition (paraphrased) | Status |
| --- | --- | --- | --- |
| `stray_at_large` | Stray / At Large | Animals stated to be unowned or free-roaming. | Confirmed |
| `relinquished_by_owner` | Relinquished by Owner | Surrendered by an owner; SAC counts adoption returns here as well. | Confirmed |
| `owner_intended_euthanasia` | Owner Intended Euthanasia | Brought in by an owner with the intent of requesting euthanasia (not the same as euthanasia provided as a standalone service). | Confirmed |
| `transfer_in_in_state` | Transferred In (in state) | Admission from another agency within the same state. | Confirmed |
| `transfer_in_out_of_state` | Transferred In (out of state) | Admission from an agency in another state or country. | To confirm |
| `seized_custody` | Seized / Custody | Taken in via confiscation, legal seizure, or protective custody. | To confirm |
| `born_in_care` | Born in Care | Born while the animal's dam was in the organization's care or foster. | To confirm |
| `other_intake` | Other Intakes | Any live intake not covered above. | To confirm |

---

## Outcome types

`outcome_type` is used on status changes and on withdrawal (for example, when a
listing becomes `adopted` or `removed`) so length-of-stay statistics stay
complete. These map to SAC's outcome categories, live and non-live. The full set
should be confirmed against the official matrix; the names below follow the
standard framework.

| API value (`outcome_type`) | SAC category | Live? | Status |
| --- | --- | --- | --- |
| `adoption` | Adoption | Live | To confirm |
| `return_to_owner` | Return to Owner / Guardian | Live | To confirm |
| `transfer_out_in_state` | Transferred Out (in state) | Live | To confirm |
| `transfer_out_out_of_state` | Transferred Out (out of state) | Live | To confirm |
| `returned_to_field` | Returned to Field | Live | To confirm |
| `other_live_outcome` | Other Live Outcome | Live | To confirm |
| `died_in_care` | Died in Care | Non-live | To confirm |
| `lost_in_care` | Lost in Care | Non-live | To confirm |
| `shelter_euthanasia` | Shelter Euthanasia | Non-live | To confirm |

For an adoptable-listing platform the overwhelmingly common exit is `adoption`,
but capturing the others honestly is what lets the stats answer the real
question: for the animals that waited longest, what actually happened to them.

---

## Age

SAC groups age coarsely — broadly, animals up to five months, adults, and age
unknown. Our `sac_age_group` enum (`under_5_months`, `adult`, `unknown`)
reflects that grouping for alignment and aggregate reporting. Because a listing
benefits from finer detail than SAC needs, the schema also accepts
`estimated_birthdate` and `age_months`, and the server can derive the coarse SAC
bucket from either. Where both a birthdate and an age are supplied, the server
flags any disagreement beyond about sixty days rather than trusting one
silently.

---

## Fields that are deliberately NOT SAC

Several fields exist for the platform's own operation and have no SAC
counterpart. They should not be described as standard-aligned: `status`
(`ListingStatus`) is our adoptable/pending/adopted lifecycle, not a SAC concept;
`size`, `coat_length`, `primary_color`, the `good_with_*` behavioral flags,
`adoption_fee`, and `listing_url` are listing attributes; and everything under
the server-computed block of the `Animal` resource (`confidence_score`,
`intake_age_days`, `submitter_verification_tier`, `provenance`, and the
deduplication fields) is internal data-quality machinery.

---

## Before freezing v1.0

Three things need to happen before the vocabulary is locked. First, pull the
current official IOD matrix and reconcile every value marked "to confirm" above,
correcting any category name or grouping that has changed. Second, decide how to
version the vocabulary itself, so that if SAC revises a category later we can map
the change without breaking shelters that integrated against the old value.
Third, socialize the mapping with SAC directly; being seen to implement their
standard faithfully is worth more than any field we could invent on our own.
