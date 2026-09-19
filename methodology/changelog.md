---
title: Methodology changelog
---

## v0.1.1 — 19 September 2026

A clarification to one publication rule. No safeguard, level, score or published finding changed, so records
researched under v0.1 remain valid and keep that version stamp.

- **Publishing a "0":** v0.1 contradicted itself. The definition of `0` said secondary verification was
  required *before publication*, while the general rules said a `0` *should* be verified before publication.
  In practice the site published unverified zeros with a provisional notice, which matched the second wording
  but not the first.
- **The rule now reads:** a `0` is never final until a second reviewer has verified it. Until then it may be
  published only as provisional, must carry the complete list of sources reviewed, and must never be presented
  as a finding that the safeguard is absent.
- **Enforcement:** `validate-data` now fails the build if an unverified `0` omits `sources_reviewed` or is not
  marked `needs_review` or `disputed`. Previously it only emitted a warning that the rule was being broken.
- **File names:** `standard/standard-v0.1.md` and `methodology/methodology-v0.1.md` keep their names. They
  are the v0.1 line of the framework; the version inside each file is authoritative.
- **Why not withhold instead:** withholding the two affected findings (HR S11, UniZg S05) would have removed
  sourced research and the complete list of documents reviewed, which is the part a reader needs in order to
  check the work. Publishing them as clearly provisional, under a rule that says so, was judged more useful
  and more honest than silence.

## v0.1 — 13 September 2026

The first public draft, published for consultation.

- **Standard and rubric:** the ASE Safeguarding Standard v0.1 defines twelve safeguards (S01–S12), each with observable criteria for levels 0–3.
- **Result values:** six distinct values, `NR`, `?`, `0`, `1`, `2` and `3`.
- **Verification:** three statuses, `verified`, `needs_review` and `disputed`. AI-assisted findings remain `needs_review` until a human verifies them.
- **No aggregation:** no overall score or ranking in Phase 1.
- **Corrections:** factual corrections are kept separate from methodological disagreements.

Proposals for v0.2 can be submitted through the methodology proposal issue template.
