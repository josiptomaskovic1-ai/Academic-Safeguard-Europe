# Correction policy

ASE's findings must be reproducible from public evidence, so anyone may challenge them.

## Who can submit

Anyone: institutions, national authorities, researchers, student representatives, members of the public. Anonymous or pseudonymous submissions are accepted, but they are assessed on the evidence alone.

## What can be submitted

| Type | Example | Effect if accepted |
|---|---|---|
| `new_source` | A policy or regulation that ASE did not review | The finding is re-assessed |
| `factual_correction` | A newer version of a document, a misread article, a wrong locator, a mistranslation | The finding is corrected |
| `broken_link` | The URL no longer resolves | The source record is updated; the finding is re-checked if the document changed |
| `methodology_disagreement` | "The rubric should treat X as equivalent to Y" | Recorded and considered for the next methodology version; findings under the current version are unchanged |

**Factual corrections** ask whether ASE applied its own rubric correctly. **Methodological disagreements** ask whether the rubric is right. Both are recorded publicly, and they are handled separately.

## How to submit

Open an issue with the **Correction** or **Methodology proposal** template on GitHub. Include:

- the record ID, shown on each page (e.g. `hr-unizg` or `country/HR`), and the safeguard ID;
- what you believe is wrong;
- the evidence: document, URL, article or section;
- for institutions, whether you are submitting on the institution's behalf.

**Do not include personal data or allegations about individuals.** Submissions containing such content will be edited or removed.

## Process and timelines

1. **Logged:** within 10 working days, the request receives an ID (`C-YYYY-NNN`) in `data/corrections.yml`.
2. **Marked as disputed:** if the request raises a substantive question about a finding, the finding's `verification` is set to `disputed` and the correction ID is added to `dispute_ids`. The site shows the finding and the dispute together. Nothing is removed while the review takes place.
3. **Reviewed:** a reviewer other than the original researcher assesses the evidence against the rubric, aiming to finish within 30 days.
4. **Decided:** the outcome is `accepted`, `partially_accepted` or `not_accepted`, and a written resolution is published in the log.
5. **Applied:** accepted changes are made in a commit that references the correction ID. The finding's previous state remains in the git history.

## Principles

- **Nothing is silently overwritten.** Every change to a finding is traceable to a commit and, where applicable, a correction ID.
- **Burden of evidence.** Corrections succeed on documents, not on authority. A university's statement that a practice exists is recorded as a reply, but it changes a score only if a published rule supports it.
- **Implementation claims.** Evidence that a safeguard works well or badly in practice is outside the scope of v0.1 scoring. It may be noted in a statement of reply.
- **Independence.** Reviewers with a conflict of interest recuse themselves.

See also the [right of reply](right-of-reply.md).
