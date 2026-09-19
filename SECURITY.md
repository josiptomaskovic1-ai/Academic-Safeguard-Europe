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

- **Content-Security-Policy** is set with `<meta http-equiv>` in `src/layouts/Base.astro`: `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests`. There is no `connect-src`, so pages cannot make network requests. Keep client scripts in external files: inline `<script>` blocks and `on*=""` handler attributes are blocked. `astro.config.mjs` sets `vite.build.assetsInlineLimit: 0` so Astro emits processed scripts as files. `npm run check-security` fails the build if any page's policy differs.
- `style-src-attr 'unsafe-inline'` remains because pages use `style=""` attributes (tile-map positions, icon sizes). `<style>` elements and stylesheets are restricted to `'self'` in browsers that support CSP Level 3; older browsers fall back to `style-src 'self' 'unsafe-inline'`. All style values are escaped by the Astro compiler and none come from free text. Only `astro dev` relaxes `style-src-elem` and adds `connect-src 'self'`.
- **Referrer-Policy** is `no-referrer` (meta), so outbound links to universities and public bodies do not reveal that a visitor came from ASE.
- **Not possible on GitHub Pages:** `frame-ancestors` and `report-uri`/`report-to` (ignored in meta CSP), `X-Frame-Options`, `Strict-Transport-Security` preload control, `Permissions-Policy`, and `X-Content-Type-Options`. The site has no logged-in state or state-changing actions, so the clickjacking impact is minimal and no JavaScript frame-buster is used. A custom domain behind a CDN that sets headers would allow these.
- GitHub, Inc. receives visitors' IP addresses and request data as the host. ASE has no access to these logs.

## Data integrity controls

- `npm run validate-data` runs on every pull request and before every deploy. Among other checks it only accepts `http(s)` URLs without embedded credentials, whitespace, control or bidirectional-override characters; warns on `http:` URLs and punycode (`xn--`) hostnames; checks DOI syntax; and requires `research_dossier` to point to an existing file under `research/`.
- Astro escapes all YAML text at build time. `set:html` is allowed only in the four icon components with constant SVG markup, and `define:vars` nowhere; `npm run check-security` enforces both.
- Data URLs are checked twice: by `validate-data`, and again at render time by `externalUrl()` in `src/lib/url.ts`, which fails the build instead of emitting a non-`http(s)` link, so `astro build` or `astro dev` run without validation cannot publish a `javascript:` link.
- `npm run check-security` scans every built page for inline scripts, event-handler attributes, disallowed URL schemes (including entity-encoded forms), external subresources, frames and objects, `target="_blank"` without `rel="noopener noreferrer"`, source maps and local paths. Raw HTML in the Markdown documents is allowed by the renderer but caught here. Plain-`http:` citation links are reported, not failed: they are navigation to historical sources, not loaded resources.
- `.github/CODEOWNERS` assigns data, methodology, scripts and workflows to the maintainer.

### Recommended repository settings (maintainer)

These cannot be committed as files and must be set in GitHub:

1. **Branch ruleset for `main`:** require a pull request with at least 1 approval, require review from Code Owners, dismiss stale approvals on new commits, require the `validate` and `dependency-review` status checks to pass, block force pushes and deletion.
2. **Environments > github-pages:** restrict deployment branches to `main`.
3. **Security:** enable private vulnerability reporting (security.txt and this policy point to it), Dependabot alerts and security updates, secret scanning with push protection, and code scanning (CodeQL default setup for JavaScript/TypeScript and Actions).
4. **Actions > General:** set the default workflow token to read-only, do not allow Actions to approve pull requests, require approval for workflows from first-time and outside contributors, and allow only GitHub-owned actions (all actions in use are `actions/*`).
5. **Accounts:** maintainers use MFA with a passkey or security key, not SMS. Consider signed commits and require them in the ruleset once all maintainers sign.

These were not verified from this repository; check them in the GitHub settings.

## Build pipeline

- Workflows default to no token permissions. Only the deploy job receives `pages: write` and `id-token: write`; the build job, which installs and runs dependency code, only has `contents: read`. CI uses `pull_request`, never `pull_request_target`, so forked pull requests get no secrets.
- Third-party actions are pinned to full commit SHAs with the release noted in a comment; `check-security` fails on an unpinned `uses:`. Dependabot (`.github/dependabot.yml`) proposes weekly updates for npm packages and actions after a 7-day cooldown.
- `actions/checkout` runs with `persist-credentials: false`.
- Installs use `npm ci` from the committed lockfile. `.npmrc` sets `ignore-scripts=true`, so no dependency `preinstall`/`install`/`postinstall` script runs, locally or in CI. `check-security` verifies every lockfile entry resolves from `registry.npmjs.org` with a `sha512` integrity hash.
- CI and deploy fail on `npm audit --audit-level=high`, a failed data validation, build, internal link check or security check. Pull requests also run `actions/dependency-review-action`.
- All three dependencies (`astro`, `@astrojs/markdown-remark`, `yaml`) are build-time only and listed as `devDependencies`; no npm package code ships to visitors except Astro's compiled output of the site's own scripts.

## Dependency status

As of 2026-09-15, `npm audit` reports **0 vulnerabilities** with `astro` 7.3.2 (314 installed packages, down from advisories in `astro` 5.18.2, `sharp` and `esbuild`). The upgrade from Astro 5 changed:

- Node.js 22.12 or later is required (`engines`, README; CI already used Node 22).
- Markdown plugins moved to `markdown.processor: unified({ rehypePlugins })`, which needs `@astrojs/markdown-remark`.
- `compressHTML: true` is set explicitly. Astro 7's new default (JSX whitespace rules) removed visible spaces between inline elements. With it set, the rendered text of all 54 pages matches the Astro 5 build except extra whitespace inside `SafeguardStrip`, and screenshots of 9 representative pages at 320, 768 and 1440 px were pixel-identical.

Run `astro dev` only on localhost, never with `--host`, and stop it when not in use: a development server is not a hardened web server. See `docs/security-model.md` for the threat model, hosting limitations and residual risks.
