---
title: Scoring methodology
version: "0.1"
status: Draft for public consultation
published: 2026-09-13
---

## 1. Unit of assessment

ASE assesses two kinds of record:

- **National frameworks:** for each of the 27 EU Member States.
- **Institutions:** individual higher-education institutions, starting with those where official documents can be verified.

Each record receives one result for each of the twelve safeguards in the Standard. ASE never aggregates results into an overall score or ranking in Phase 1.

## 2. Result values

| Value | Label | Use when |
|---|---|---|
| `NR` | Not researched | No research has been carried out. |
| `?` | Unable to assess | Research was done, but the sources were insufficient, inaccessible, contradictory or ambiguous. |
| `0` | Not identified | Research was done and no qualifying provision was identified in the sources reviewed. |
| `1` | Limited | See the rubric level for the safeguard. |
| `2` | Substantial | See the rubric level. |
| `3` | Strong | See the rubric level. |

These values are not interchangeable:

- **`NR` never becomes `0`.** A jurisdiction that has not been researched is not a poor performer.
- **`?` is not `0`.** It records the limits of the evidence.
- **`0` is not proof of absence.** It states that nothing qualifying was identified in the sources listed. Every `0` lists the sources reviewed, and should be checked by a second reviewer before publication.

## 3. Sources

Formal scores rest on primary sources, in this order of priority:

1. national legislation;
2. official ministry or regulator sources;
3. university statutes;
4. university regulations;
5. official complaint procedures;
6. ethics codes;
7. ombuds procedures;
8. quality-assurance standards;
9. official institutional guidance.

Secondary sources (research articles, news, NGO reports) may explain context but do not normally determine a score. Every source is recorded once, with a stable ID, the date it was accessed and, where possible, an archived copy.

## 4. Assigning a score

For each safeguard the researcher:

1. **Identifies** the relevant provisions and records each source.
2. **Records** the exact location (article, section or page).
3. **Summarises** what the provision says, as a paraphrase.
4. **Compares** the provision with the rubric levels, starting from the highest level and moving down until every listed element is met.
5. **Writes** a rationale explaining why this level applies and not the next one up.
6. **Assigns** confidence: `high`, `medium` or `low`.

Rules applied to every safeguard:

- **Choose the lower level** when two levels are plausible, and explain the uncertainty.
- **Count only provisions that apply to students** (including doctoral candidates) as potential complainants. Staff-only procedures are noted, not scored.
- **Elements may be combined** across documents if each is cited.
- **Binding and non-binding texts are distinguished.** Non-binding guidance can support a finding but rarely justifies the highest level.
- **Formal policy is not evidence of implementation.**

## 5. Verification

| Status | Meaning | Shown on the site as |
|---|---|---|
| `needs_review` | Proposed, not yet independently checked | **Provisional**, with a warning |
| `verified` | A second reviewer re-opened the source, checked the locator and interpretation, and confirmed the level | Completed finding |
| `disputed` | A correction request or reviewer objection is open | Finding **and** dispute, side by side |

Only `verified` findings count as completed research. A verifier may not verify their own finding.

### Research assisted by AI tools

ASE may use AI tools to locate documents and draft proposed findings. Such findings are always `needs_review` until a human reviewer has checked the source, the locator and the level. Automated cross-checks, including an independent AI verification pass, are recorded in the research dossier, but they do not make a finding `verified`.

## 6. Research status

**Countries:**

- **Not researched:** no findings.
- **Research underway:** work has started; findings may be incomplete or entirely provisional.
- **Partially researched:** some safeguards have findings; others remain `NR`.
- **National framework reviewed:** all twelve safeguards have a national-level result other than `NR`, whether verified or not.
- **Institution-level research available:** the national framework has been reviewed and at least one institution profile exists.

**Institutions:** research underway, partially researched, researched.

## 7. Confidence

- **High:** the source is primary, current and official, the provision is directly on point, and the interpretation is straightforward.
- **Medium:** the source is primary, but the interpretation requires some inference, or its currency is unconfirmed.
- **Low:** the finding relies on secondary sources or uncertain translation, or involves significant interpretive judgement.

## 8. Reproducibility

The rubric, every source, every locator and every rationale are public. A university, a student representative body or an independent researcher should be able to reproduce any score from the published material, or explain precisely where they disagree.

## 9. Corrections and changes

- **Factual corrections:** a missing policy, a newer regulation, a broken link or a misread provision. These are assessed against the rubric and, if accepted, change the finding.
- **Methodological disagreements:** these are recorded publicly and considered in the next methodology version. They do not change findings under the current version.

Earlier findings remain in the git history. See the correction policy.

## 10. Language

ASE writes "No qualifying provision was identified in the sources reviewed", not "this university has no protection". It writes "ASE could not verify…", not "the institution refuses…". It describes "published institutional safeguards", never "how safe a university is".

## 11. Known limitations of v0.1

- **National variation.** Legal systems differ. A safeguard may sit in general administrative law, labour law or anti-discrimination law rather than in higher-education law. Researchers should look for functional equivalents and explain them.
- **National and institutional layers** interact. National results do not describe individual institutions.
- **Faculty-level rules** are not yet assessed systematically.
- **Language access.** Translation affects confidence.
- **Documents change.** Every finding carries a review date, and findings older than twelve months are flagged.
