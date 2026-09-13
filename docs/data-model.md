# Data model

The repository is the database. All research data is plain YAML under `data/`, and every record is checked by `npm run validate-data` before the site builds.

Code in `src/` only displays this data. It never fills gaps: a missing value stays missing on the site.

## Result values

| Value | Label | Meaning |
|---|---|---|
| `NR` | Not researched | No research has been done. Says nothing about whether a safeguard exists. |
| `?` | Unable to assess | Research was done, but the sources were insufficient, ambiguous or inaccessible. |
| `0` | Not identified | Research was done and no qualifying provision was identified in the sources reviewed. This does not prove absence. |
| `1` | Limited | See `methodology/scoring-rubric.yml`. |
| `2` | Substantial | See rubric. |
| `3` | Strong | See rubric. |

Always write results as quoted strings (`"NR"`, `"0"`) so YAML does not turn them into numbers.

## Country record — `data/countries/<slug>.yml`

| Field | Type | Required | Notes |
|---|---|---|---|
| `iso_code` | ISO 3166-1 alpha-2 | yes | Must be one of the 27 EU Member States. |
| `slug` | string | yes | Must match the file name. |
| `name`, `local_name` | string | yes | |
| `eu_status` | `member_state` | yes | |
| `eu_accession_year` | integer | yes | |
| `methodology_version` | string | yes | Must exist in `scoring-rubric.yml`. |
| `research_status` | enum | yes | `not_researched`, `research_underway`, `partially_researched`, `national_framework_reviewed`, `institution_research_available` |
| `last_reviewed` | `YYYY-MM-DD` or null | if any result is not NR | |
| `confidence` | `high` / `medium` / `low` / null | no | Overall confidence in the national findings. |
| `national_framework.summary` | text or null | no | Neutral description, based on sources. |
| `safeguards` | map of `S01`–`S12` | yes, all 12 | Each value is a **safeguard result** (below). |
| `institutions_researched` | list of institution IDs | no | Each must exist under `data/institutions/`. |
| `evidence_gaps` | list of text | no | |
| `researcher_notes` | text or null | no | |
| `research_method` | text | no | Discloses how research was done (e.g. AI-assisted with human verification pending). |

## Safeguard result

```yaml
S02:
  result: "2"                     # NR | ? | 0 | 1 | 2 | 3
  verification: needs_review      # verified | needs_review | disputed
  confidence: medium              # high | medium | low
  source_ids: [hr-zvozd-2022]
  locator: "Article 23(2)"
  evidence: >-
    Paraphrase of what the provision says.
  rationale: >-
    Why this matches the rubric level and not the next one up.
  sources_reviewed: [hr-zvozd-2022]   # required for "0" and "?"
  gaps: >-
    What was not found or remains uncertain.
  reviewed: "2026-09-13"
  dispute_ids: []                 # correction IDs, required when verification is disputed
  second_reviewer: null           # contributor ID of the verifier, required when verification is verified
```

Rules the validator enforces:

- `NR` results carry no other fields except optional notes.
- Every other result needs `verification`, `source_ids` (at least one, all existing), `rationale` and `reviewed`.
- Results `1`–`3` also need `evidence`, `locator` and `confidence`.
- `0` and `?` also need `sources_reviewed`.
- Only `verified` results appear as completed findings. `needs_review` results are shown as **provisional**, and `disputed` results are shown with the dispute.

## Institution record — `data/institutions/<iso-lowercase>/<id-suffix>.yml`

| Field | Required | Notes |
|---|---|---|
| `id` | yes | `<iso-lowercase>-<slug>`, e.g. `hr-unizg`. Must match the path. |
| `canonical_name`, `local_name` | yes / no | |
| `country` | yes | ISO code of an existing country record. |
| `website` | yes | https URL. |
| `institution_type` | yes | `public_university`, `private_university`, `university_of_applied_sciences`, `polytechnic`, `other` |
| `research_status` | yes | `research_underway`, `partially_researched`, `researched` |
| `last_reviewed` | yes | |
| `methodology_version` | yes | |
| `confidence` | no | |
| `evidence_note` | no | |
| `safeguards` | yes, all 12 | Safeguard results, as above. |
| `correction_status` | yes | `none`, `open`, `resolved` |
| `research_method` | no | |
| `evidence_gaps` | no | List of text. |
| `replies` | no | Statements of reply: `{ received, submitted_by, text }`, max 300 words. |

## Source record — `data/sources/<scope>.yml`

Each file contains `sources:`, a list. The file name is a grouping convenience (`hr.yml`, `eu.yml`); IDs must be unique across all files.

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Lowercase, `[a-z0-9-]`, stable forever. Never reuse a retired ID. |
| `title` | yes | Original-language title. |
| `title_en` | no | |
| `issuing_body` | yes | |
| `url` | yes | Must be `http(s)`. |
| `document_type` | yes | `legislation`, `regulation`, `statute`, `policy`, `code_of_ethics`, `procedure`, `guidance`, `report`, `standard`, `other` |
| `country` | yes | ISO code, or `EU` / `EHEA` / `INT`. |
| `institution` | no | Institution ID. |
| `publication_date` | no (warning) | `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. |
| `official_reference` | no | e.g. official gazette number. |
| `accessed` | yes | Date the source was last opened. |
| `language` | yes | ISO 639-1. |
| `archived_url` | no (warning) | Wayback Machine or similar. |
| `notes` | no | Currency and consolidation caveats. |

## Evidence Library — `evidence-library/items.yml`

These are background and context items, not scoring sources. Fields: `id`, `title`, `author_body`, `year`, `jurisdiction`, `categories` (from the fixed list in the validator), `source_type`, `url`, `doi`, `summary`, `notes`.

## Corrections log — `data/corrections.yml`

```yaml
corrections:
  - id: C-2026-001
    received: "2026-10-01"
    type: factual_correction        # factual_correction | methodology_disagreement | new_source | broken_link
    target: hr-unizg/S05            # record ID, optionally /safeguard
    submitted_by_role: institution  # institution | researcher | student_representative | public | anonymous
    summary: Neutral summary; no personal data.
    status: open                    # open | under_review | accepted | partially_accepted | not_accepted
    resolution: null
    resolved: null
```

Disputed findings are never silently overwritten. The previous result stays in git history, and the correction entry records what changed and why.

## Raw research — `research/`

- `pending/`: researcher dossiers that have not been verified yet, in the same shape as the fields above.
- `verified/`: dossiers after secondary verification, with the verifier's notes.
- `disputed/`: dossiers linked to open corrections.

Findings reach `data/` only through a pull request that follows `docs/researcher-guide.md`.
