# Product specification — Phase 1 (v0.1)

## Mission

To show, with evidence, whether universities and national higher-education systems in the EU provide credible **published** safeguards against:

- abuse of academic authority;
- retaliation, intimidation and harassment;
- conflicts of interest;
- misuse of assessment or supervisory power;
- procedural unfairness;
- failure to repair academic harm.

ASE evaluates systems, never individuals.

## Audiences and their primary questions

| Audience | Primary question | Main journey |
|---|---|---|
| Students | "If I report a problem at my university, what protects me?" | Home → Europe → Country → Institution → safeguard evidence |
| Student representatives | "Where are our rules weaker than elsewhere, and what should we ask for?" | Country or institution → Compare safeguard → Standard |
| Researchers | "How was this coded, and can I reuse the data?" | Methodology → Sources → Open data |
| Journalists | "Is this credible, and what exactly does it claim?" | About (scope) → Methodology → finding evidence |
| Universities | "Is our profile accurate, and how do we correct it?" | Institution → Corrections → right of reply |
| Policymakers and QA bodies | "What does the national framework require?" | Country → national matrix → Compare |
| Civil society | "How can we contribute research?" | Contribute → researcher guide |

## Information architecture

```
Home
├── Europe (tile map + table)
│   └── Country × 27
│       └── Institution profiles
├── Compare safeguards
│   └── Safeguard × 12 (across countries)
├── Standard (prose + rubric per safeguard)
├── Methodology
│   └── Changelog
├── Evidence Library (filterable)
├── Sources (register, anchor per source ID)
├── Corrections (process + public log)
├── Contribute
├── Open data (JSON exports)
└── About (scope, limits, privacy, licences)
```

## In scope for Phase 1

The 18 deliverables of the build brief:

- all 27 Member States represented;
- Standard v0.1, rubric and methodology;
- country and institution pages;
- Evidence Library, source register and citations;
- corrections process and log;
- changelog and open data;
- contributor documentation and data validation;
- GitHub Pages deployment.

## Explicitly excluded from Phase 1

- Allegation submission of any kind, including anonymous accusations and crowdsourced allegations.
- Ratings, rankings or naming of individual academics.
- Discussion forums and social networking.
- Legal representation, legal advice or AI legal advice.
- Complaint adjudication.
- User accounts.
- Overall scores or rankings of universities or countries.

## Acceptance criteria

1. **Every Member State has a page** showing its research status, even when it is `not_researched`.
2. **No page shows a score without a cited source and locator**, and the validator enforces this.
3. **`NR`, `?` and `0` are visually and textually distinct everywhere**, and none is ever converted into another.
4. **Provisional and disputed findings are labelled** wherever they appear.
5. **Every status, score and badge has a text label**, so meaning never depends on colour.
6. **Pages work without JavaScript.** Only the Evidence Library filter is an enhancement.
7. **Pages work at 360px width** and are keyboard accessible.
8. **Pages print** with all evidence panels expanded.
9. **The scope statement is visible** on the homepage and in every page footer.
10. **Every finding offers a route to request a correction**, from its country or institution page.
11. **`npm run build` fails** on invalid data.
12. **No cookies, analytics or third-party requests.**
13. **Deploys to GitHub Pages** with no paid service.

## The 60-second test

A first-time visitor must be able to answer:

| Question | Where it is answered |
|---|---|
| What is ASE? | Home hero |
| What does it measure? | Home §02 and the Standard |
| What does it not measure? | Home §02, the scope box and the footer |
| How was a score determined? | The expanded safeguard card (rubric level and rationale), and Methodology |
| What evidence supports it? | The expanded safeguard card (evidence, locator and source) |
| Is this country fully researched? | The status and coverage panel at the top of the country page, plus the incomplete-research notice |
| Can an institution challenge a finding? | The correction panel on every profile, and the Corrections page |
| Can I contribute? | Home §09 and Contribute |
| Is the methodology public? | Navigation: Standard and Methodology |
| Is the data public? | Open data and GitHub links on every record |

## Roadmap

- **Milestone 1:** architecture, design system, methodology, schema and the 27 country records. *Done in v0.1.*
- **Milestone 2:** deep research on Croatia, the first methodology test. *Provisional findings published; human verification pending.*
- **Milestone 3:** national frameworks in more Member States. *Ireland and the Netherlands are queued.*
- **Milestone 4:** recruiting contributors with national language and legal expertise.
- **Milestone 5:** progressive institution-level coverage.
