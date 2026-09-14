# Security policy

Academic Safeguard Europe (ASE) is a static website built from YAML research data and published on GitHub Pages. It has no backend, accounts, cookies, analytics or third-party scripts. Its main security concern is the **integrity** of the published research and of the build and deploy pipeline.

## Scope

In scope:

- The website at <https://josiptomaskovic1-ai.github.io/Academic-Safeguard-Europe/> and its source in this repository.
- Integrity of the research data (`data/`, `research/`, `evidence-library/`, `methodology/`), for example a way to publish altered findings or disguised links without review.
- The validation scripts (`scripts/`) and GitHub Actions workflows (`.github/workflows/`).
- Privacy issues, such as the site leaking information about visitors to third parties.

Out of scope:

- Allegations about individual academics or institutions, and disagreement with findings. ASE does not investigate individual cases. Use the [correction process](https://josiptomaskovic1-ai.github.io/Academic-Safeguard-Europe/corrections/) for errors in findings.
- Missing HTTP security headers that GitHub Pages does not let the project set (see below).
- Vulnerabilities in GitHub itself. Report those to [GitHub](https://bounty.github.com/).

## Reporting a vulnerability

Report privately through GitHub: **[Report a vulnerability](https://github.com/josiptomaskovic1-ai/Academic-Safeguard-Europe/security/advisories/new)** (Security tab > Report a vulnerability). Do not open a public issue for security problems.

- We aim to acknowledge reports within **7 days** and to agree a disclosure timeline with you.
- Do not include personal data about third parties in a report.
- This is a volunteer project with no bug bounty. Reporters are credited in the advisory if they wish.

A machine-readable contact file is published at `/.well-known/security.txt` under the site base path, i.e. <https://josiptomaskovic1-ai.github.io/Academic-Safeguard-Europe/.well-known/security.txt>. RFC 9116 expects the file at the domain root, which a GitHub Pages *project* site cannot serve; it will be at the root automatically if the site moves to a custom domain. Update its `Expires` field at least once a year.

## Hosting limitations (GitHub Pages)

GitHub Pages does not allow custom HTTP response headers. ASE therefore uses `<meta>` equivalents where they exist:

- **Content-Security-Policy** is set with `<meta http-equiv>` in `src/layouts/Base.astro`: `default-src 'none'`, `script-src 'self'` (no inline scripts), `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `base-uri 'self'`, `form-action 'none'`, `object-src 'none'`. Keep client scripts in external files: inline `<script>` blocks and `on*=""` handler attributes are blocked. `astro.config.mjs` sets `vite.build.assetsInlineLimit: 0` so Astro emits processed scripts as files.
- `style-src` still allows `'unsafe-inline'` because pages use `style=""` attributes (for example tile-map positions). All style values are escaped by the Astro compiler and none come from free text.
- **Referrer-Policy** is `no-referrer` (meta), so outbound links to universities and public bodies do not reveal that a visitor came from ASE.
- **Not possible on GitHub Pages:** `frame-ancestors` and `report-uri`/`report-to` (ignored in meta CSP), `X-Frame-Options`, `Strict-Transport-Security` preload control, `Permissions-Policy`, and `X-Content-Type-Options`. The site has no logged-in state or state-changing actions, so the clickjacking impact is minimal and no JavaScript frame-buster is used. A custom domain behind a CDN that sets headers would allow these.
- GitHub, Inc. receives visitors' IP addresses and request data as the host. ASE has no access to these logs.

## Data integrity controls

- `npm run validate-data` runs on every pull request and before every deploy. Among other checks it only accepts `http(s)` URLs without embedded credentials, whitespace, control or bidirectional-override characters; warns on `http:` URLs and punycode (`xn--`) hostnames; checks DOI syntax; and requires `research_dossier` to point to an existing file under `research/`.
- Astro escapes all YAML text at build time. The code must not use `set:html` or `define:vars` with data values.
- `.github/CODEOWNERS` assigns data, methodology, scripts and workflows to the maintainer.

### Recommended repository settings (maintainer)

These cannot be committed as files and must be set in GitHub:

1. **Branch ruleset for `main`:** require a pull request with at least 1 approval, require review from Code Owners, dismiss stale approvals on new commits, require the `Validate` status check to pass, block force pushes and deletion.
2. **Environments > github-pages:** restrict deployment branches to `main`.
3. **Security:** enable private vulnerability reporting, Dependabot alerts and Dependabot security updates.
4. **Actions > General:** set the default workflow token to read-only and do not allow Actions to approve pull requests.

## Build pipeline

- Workflows default to no token permissions. Only the deploy job receives `pages: write` and `id-token: write`; the build job, which runs `npm ci` and package install scripts, only has `contents: read`.
- Third-party actions are pinned to full commit SHAs with the release noted in a comment. Dependabot (`.github/dependabot.yml`) proposes weekly updates for npm packages and actions.
- `actions/checkout` runs with `persist-credentials: false`.

## Known dependency advisories

As of 2026-09-14, `npm audit` reports advisories in `astro` 5.18.2 (the last 5.x release; fixes require the breaking upgrade to astro 7.3.2 or later), `sharp` and `esbuild`. Reachability for this project:

- **Not reachable in the deployed site.** The output is prerendered static HTML. The astro advisories concern SSR, middleware, server islands, View Transitions, `define:vars`, spread attributes and AVIF image optimisation, none of which the site uses. `sharp` issues need untrusted images to be processed; the site does no image processing.
- **Reachable locally:** the `esbuild` dev-server advisory allows file reads from a running dev server on Windows. Run `astro dev` only on localhost, never with `--host`, and stop it when not in use.

Until the astro 7 upgrade lands as its own reviewed change, do not add `astro:assets`/`<Image>` processing, SSR adapters or server islands.
