# Researcher guide

This guide explains how to add research without touching application code. Read the [Standard](../standard/standard-v0.1.md), the [methodology](../methodology/methodology-v0.1.md) and the [rubric](../methodology/scoring-rubric.yml) first.

## The workflow

```
SOURCE FOUND
↓
SOURCE RECORDED            data/sources/<cc>.yml
↓
PROPOSED INTERPRETATION    research/pending/<dossier>.yml
↓
PROPOSED SCORE             data/... with verification: needs_review
↓
METHODOLOGY CHECK          maintainer or reviewer, against the rubric
↓
SECONDARY VERIFICATION     a different person re-opens the source
↓
VERIFIED                   verification: verified, second_reviewer recorded
↓
PUBLICATION                merged to main → site rebuilds
```

A search result never becomes a public score directly.

## 1. Record a source

Add an entry to `data/sources/<iso-lowercase>.yml`. Use `eu.yml` for European-level sources.

```yaml
sources:
  - id: hr-zvozd-2022                 # stable, lowercase, never reused
    title: Zakon o visokom obrazovanju i znanstvenoj djelatnosti
    title_en: Act on Higher Education and Scientific Activity
    issuing_body: Croatian Parliament (Hrvatski sabor)
    url: https://narodne-novine.nn.hr/...
    document_type: legislation
    country: HR
    institution: null
    publication_date: "2022-10-14"
    official_reference: NN 119/2022
    accessed: "2026-09-13"
    language: hr
    archived_url: null
    notes: Consolidation status, amendments, version caveats.
```

Checklist:

- [ ] You actually opened the document at this URL.
- [ ] The source is official: an official gazette, ministry, regulator or the institution's own domain.
- [ ] It is the current version, or `notes` explains otherwise.
- [ ] You saved an archive copy, for example at https://web.archive.org/save, and put it in `archived_url`.

## 2. Propose a finding

Edit the safeguard entry in the relevant country or institution file:

```yaml
S03:
  result: "2"
  verification: needs_review
  confidence: medium
  source_ids: [hr-zvozd-2022]
  locator: "Article 40(1)–(3)"
  evidence: >-
    Paraphrase of what the provision says. Short quotations (up to 25 words) only if exact.
  rationale: >-
    Why the "2" criteria are met and why the "3" criteria are not.
  gaps: >-
    What remains uncertain.
  reviewed: "2026-09-13"
```

Rules:

- **Start from level 3 and work down.** Assign the highest level whose every element is met.
- **For `0`,** list every source you reviewed in `sources_reviewed`, and describe the search in `gaps`.
- **Use `?`** if the text is ambiguous or you could not access it. Explain in `rationale` and list `sources_reviewed`.
- **Update the record-level fields:**
  - `research_status`;
  - `last_reviewed`;
  - `national_framework.summary` for countries, or `evidence_note` for institutions;
  - `evidence_gaps`.
- **Add a dossier** to `research/pending/` recording your working notes, and include the `unresolved` questions.
- **Run `npm run validate-data`.**

### Language

| Write | Not |
|---|---|
| No qualifying provision was identified in the sources reviewed. | The university has no protection. |
| ASE could not verify… | The institution refuses… |
| The regulation provides… | The university protects students… |
| Published institutional safeguards | How safe the university is |

## 3. Add an institution

Create `data/institutions/<cc>/<slug>.yml`. The `id` must be `<cc>-<slug>`, for example `hr-unizg`.

```yaml
id: hr-unizg
canonical_name: University of Zagreb
local_name: Sveučilište u Zagrebu
country: HR
website: https://www.unizg.hr
institution_type: public_university
research_status: researched
last_reviewed: "2026-09-13"
methodology_version: "0.1"
confidence: medium
evidence_note: >-
  Neutral summary of the published safeguard architecture.
correction_status: none
safeguards:
  S01: { result: "NR" }
  # ... all twelve
evidence_gaps: []
```

Then add the ID to `institutions_researched` in the country file.

Start with these university-wide documents:

- statute;
- study regulations;
- doctoral regulations;
- code of ethics and ethics committee rules;
- student ombudsperson rules;
- harassment and dignity policies;
- complaint procedures.

Note in `evidence_gaps` where faculty-level rules exist but were not reviewed.

## 4. Verify a finding

You must not have proposed the finding, and you must not have a conflict of interest with the institution concerned.

1. **Re-open the source yourself** from the URL, not from the researcher's notes.
2. **Read the full provision** at the locator, and the surrounding articles, including definitions and scope.
3. **Check that the provision applies to students.**
4. **Check the currency of the document.** Is there a newer version or an amendment?
5. **Check the level against the rubric,** from level 3 downward.
6. **Check the wording** for overstatement, certainty that the evidence does not support, and anything that could read as an allegation.
7. **Record the outcome:**
   - **Confirmed:** set `verification: verified`, add `second_reviewer: <your contributor ID>`, and move or copy the dossier to `research/verified/` with your notes.
   - **Disagree:** leave the finding as `needs_review` and explain in the PR, or propose a changed result with reasons.

Automated or AI-assisted checks are welcome as an aid, but they do not count as secondary verification.

## 5. Research assisted by AI tools

AI tools may help locate documents and draft findings. Their use must be disclosed in `research_method`. Every AI-assisted finding stays `needs_review` until a human verifier has completed step 4. Never publish a URL, article number or quotation that a human or a fetched document has not confirmed.
