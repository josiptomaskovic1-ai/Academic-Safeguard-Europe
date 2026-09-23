# Academic Safeguard Europe

> **Academic authority needs accountability.**
> No student should risk their education for reporting abuse.

Academic Safeguard Europe (ASE) is an open-source initiative examining how universities and European higher-education systems protect students from abuse of academic authority, retaliation, conflicts of interest and procedural unfairness.

ASE evaluates institutional safeguards and published rules. **It does not rate individual academics or determine whether specific misconduct allegations are true.**

**Website:** https://josiptomaskovic1-ai.github.io/Academic-Safeguard-Europe/

## What is in this repository

| Path | Contents |
|---|---|
| `standard/` | StudentSafe Standard v0.1, independent draft (prose) |
| `methodology/` | Scoring methodology, the machine-readable **scoring rubric** (`scoring-rubric.yml`) and the changelog |
| `data/countries/` | One record per EU Member State (all 27) |
| `data/institutions/` | Institution profiles, one folder per country |
| `data/sources/` | Source register with stable IDs |
| `data/corrections.yml` | Public corrections log |
| `evidence-library/` | Background and context references |
| `research/` | Research dossiers: `pending/`, `verified/`, `disputed/` |
| `docs/` | Product spec, data model, researcher guide, correction policy, reviews |
| `scripts/` | Data validation and link checking |
| `src/` | Static website (Astro) |

**The repository is the database.** The website only displays the YAML data and never fills gaps. A value that is missing in the data stays missing on the site.

## Result values

| Value | Meaning |
|---|---|
| `NR` | Not researched |
| `?` | Unable to assess |
| `0` | No qualifying provision identified in the sources reviewed (not proof of absence) |
| `1` / `2` / `3` | Limited / Substantial / Strong, as defined in the rubric |

`NR` never becomes `0`. Findings are `verified`, `needs_review` (shown as provisional) or `disputed`.

## Current research status

All 27 Member States have a record. Croatia is the first methodology test:

- the Croatian national framework and the University of Zagreb have findings for all twelve safeguards;
- all of those findings are **provisional**: they were researched with AI assistance and have had an automated cross-check, but they still need verification by a human reviewer;
- the other 26 Member States are *not researched*.

See `docs/adversarial-review.md` for known credibility risks and the mitigations in place.

## Running locally

Requirements: Node.js 22.12 or later.

```bash
npm ci                  # exact lockfile install; dependency install scripts are disabled in .npmrc
npm run dev             # http://localhost:4321/Academic-Safeguard-Europe/ (localhost only; never use --host)
npm run validate-data   # check all research data
npm run build           # validate + build static site into dist/
npm run check-links     # after build: verify internal links and anchors
npm run check-security  # after build: CSP, unsafe URLs/markup, pinned actions, secrets (see SECURITY.md)
```

## Deployment (€0)

GitHub Actions builds the site and deploys it to GitHub Pages on every push to `main`. One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

To use a custom domain, set the `SITE_URL` and `BASE_PATH` (usually `/`) variables in the workflow and add a `public/CNAME` file.

| Item | Cost |
|---|---|
| Hosting, CI/CD, repository, database | €0 (GitHub) |
| Analytics | none |
| Domain (optional) | €10–30/year |

## Contributing

Research contributions don't require touching the application code. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/researcher-guide.md](docs/researcher-guide.md).

- **Corrections and right of reply:** [docs/correction-policy.md](docs/correction-policy.md)
- **Code of conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Privacy

The site is static, sets no cookies, uses no analytics and loads no third-party resources. The data contains no personal data, no allegations, and no names of staff or students.

## Licences

- **Code:** [MIT](LICENSE)
- **Standard, methodology, data and texts:** [CC BY 4.0](LICENSE-DATA.md)
