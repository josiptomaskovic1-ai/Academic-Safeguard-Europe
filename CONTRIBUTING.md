# Contributing to Academic Safeguard Europe

Thank you for helping. The most valuable contributions are **research and verification by people who can read national legislation and university rules in the original language**.

You don't need to change application code to contribute research. Everything is plain YAML.

## Ground rules

1. **Never invent or guess** laws, document names, URLs, article numbers, quotations, dates or procedures.
2. **Keep the result values distinct.** `NR` is not researched, `?` is unable to assess, and `0` means researched with nothing qualifying identified. `NR` never becomes `0`.
3. **When two levels are plausible, choose the lower** and explain why.
4. **No personal data.** No names of staff or students, no allegations, no complaint files, no health or disciplinary information.
5. **Neutral language.** Write "No qualifying provision was identified in the sources reviewed", not "the university has no protection".
6. **Disclose conflicts of interest.** For example, say if you work for or study at the institution you are researching. Having a conflict does not exclude you, but you may not verify findings about that institution.

## What you can contribute

| I want to… | Do this |
|---|---|
| Add a source | Add an entry to `data/sources/<country>.yml`. See the [guide](docs/researcher-guide.md#1-record-a-source). |
| Propose a country finding | Edit `data/countries/<country>.yml` with `verification: needs_review`, and add a dossier in `research/pending/`. See the [guide](docs/researcher-guide.md#2-propose-a-finding). |
| Add an institution | Create `data/institutions/<cc>/<slug>.yml`. See the [guide](docs/researcher-guide.md#3-add-an-institution). |
| Verify a finding | Follow the [verification guide](docs/researcher-guide.md#4-verify-a-finding). |
| Correct a finding | Open a **Correction** issue. See the [correction policy](docs/correction-policy.md). |
| Propose a methodology change | Open a **Methodology proposal** issue. |
| Fix the website | Open a pull request touching `src/`. Keep JavaScript minimal and pages accessible. |

If you are not comfortable with git, open an issue using the relevant template and a maintainer will turn it into a pull request.

## Pull requests

Every research pull request must state:

- jurisdiction, and institution if relevant;
- safeguard ID and proposed result;
- evidence and exact source reference (article, section, page);
- rationale against the rubric;
- review date and methodology version;
- your identity or a pseudonymous contributor ID.

Run the checks before opening a PR:

```bash
npm ci
npm run validate-data
npm run build && npm run check-links
```

CI runs the same checks, and a PR cannot be merged while they fail.

**Verification rule:** a finding may be marked `verified` only by a reviewer who did not propose it. The reviewer records their contributor ID in `second_reviewer`, which is strongly expected for any `0`.

## Website development

- **Stack:** Astro (static), TypeScript, plain CSS.
- **Dependencies:** no new runtime dependencies or external services without discussion. Ask first: *can this be done statically or through GitHub for €0?*
- **Accessibility:** keyboard access, semantic HTML, a text label for every status, and nothing conveyed by colour alone.
- **No tracking:** no cookies, analytics or third-party fonts and scripts.
