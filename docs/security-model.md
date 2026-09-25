# Security model

Companion to [`SECURITY.md`](../SECURITY.md), which covers reporting and the controls in place. This page records what ASE defends against, what the hosting model cannot enforce, and what remains. No website can be guaranteed immune from compromise; the aim is a small attack surface and a build chain that fails loudly.

Reviewed 2026-09-15 against Astro 7.3.2.

## What there is to attack

ASE is prerendered HTML, CSS and four small same-origin scripts (mobile menu and evidence accordion, Evidence Library filter, table-of-contents collapse, and a forwarder on `/evidence/` that sends old `#item` links to `/evidence/library/` only when the fragment matches a known item id) plus `public/scripts/print.js`. There is no server code, database, login, cookie, form submission, analytics, third-party script, font, embed or iframe. The five `/data/*.json` exports are static files.

The serif typeface, Literata (SIL Open Font License 1.1, licence text in `public/fonts/Literata-OFL.txt`), is self-hosted as three WOFF2 files under `src/assets/fonts/`. Astro bundles them with base-aware URLs and loads them from `'self'` (`font-src 'self'`); no font service is contacted.

| Asset | Realistic threat | Main controls |
|---|---|---|
| Published findings and citations | Altered scores or disguised links merged without review | CODEOWNERS, branch ruleset (manual), `validate-data`, public history |
| Visitors' browsers | Script injection through data, Markdown or a dependency | Astro escaping, `externalUrl()`, `set:html` allowlist, CSP, `check-security` |
| Build and deploy pipeline | Malicious npm release, compromised action, forked PR abusing tokens | `npm ci` + lockfile integrity, `ignore-scripts`, SHA-pinned actions, read-only build job, `pull_request` only, audit and dependency review |
| Visitors' privacy | Referrer leaks, third-party requests | No third-party resources, `Referrer-Policy: no-referrer` (meta) |
| Contributors' privacy | Personal data posted into public issues | Explicit warnings in every issue template and on the site; no fake private channel |
| Maintainer accounts and domain | Account takeover publishes anything | MFA, rulesets, environment protection (manual; see SECURITY.md) |

Client-side input is limited to the URL fragment (used only with `getElementById`, and malformed escapes are ignored) and the Evidence Library filter (compared against pre-rendered `data-*` attributes; output is `textContent` and `hidden`). Neither reflects input into markup.

## GitHub Pages cannot send these headers

GitHub Pages serves fixed response headers. The project cannot add or change them, and a `<meta>` tag is not equivalent for most of them.

| Protection | Status on ASE |
|---|---|
| `Content-Security-Policy` | **Active via `<meta>`**, except `frame-ancestors`, `report-uri`/`report-to` and `sandbox`, which browsers ignore in meta. |
| `Referrer-Policy` | **Active via `<meta name="referrer" content="no-referrer">`.** |
| `Strict-Transport-Security` | Sent by GitHub for `*.github.io`; ASE cannot control `max-age` or preload. With a custom domain, enable *Enforce HTTPS* in Pages settings. |
| `X-Frame-Options` / CSP `frame-ancestors` | **Not available.** Any site can frame ASE pages. |
| `X-Content-Type-Options: nosniff` | Not controllable. Risk is low: every published file has a standard extension that GitHub serves with a correct type, and no user uploads exist. |
| `Permissions-Policy` | Not available. The site uses no powerful browser features. |
| `Cross-Origin-Opener-Policy` / `-Embedder-Policy` / `-Resource-Policy` | Not available. No cross-origin isolation is needed. |
| Custom error responses, redirects, cache control | Not available beyond `404.html`. |

Adding an ineffective meta tag (for example `X-Frame-Options` in `<meta>`) would suggest protection that does not exist, so none is added.

### Clickjacking

No page has a legitimate reason to be embedded, but framing cannot be prevented on GitHub Pages. Impact is low: there is no logged-in state, no state-changing action and nothing to click that has side effects. The links most worth tricking someone into (GitHub issue forms) open GitHub, which refuses to be framed. A JavaScript frame-buster is not used: it is bypassable and adds script for little gain.

### If header control becomes necessary

A CDN or host in front of the site (Cloudflare, Netlify, Vercel or similar) could send `frame-ancestors 'none'`, `nosniff`, HSTS with preload, `Permissions-Policy` and CSP reporting. The trade-offs: another provider sees visitor traffic (a privacy change that must be disclosed), another account can alter the site, and configuration moves outside the reviewed repository. This is a recommendation only; hosting stays on GitHub Pages unless a migration is explicitly approved.

## Custom domain checklist

None is configured (`public/CNAME` is absent). If one is added:

1. Verify the domain in GitHub account settings **before** pointing DNS at Pages, to prevent takeover of a dangling record; remove DNS records promptly if Pages is ever disabled.
2. Enable *Enforce HTTPS* in Pages settings.
3. Add CAA records allowing only the certificate authorities GitHub Pages uses (currently Let's Encrypt: `0 issue "letsencrypt.org"`).
4. Protect the registrar account with MFA (passkey or security key), enable the registrar transfer lock, and keep the recovery email on a separate, MFA-protected account.
5. Enable DNSSEC if both registrar and DNS host support it and someone can maintain it; a broken DNSSEC chain takes the site offline.
6. Set `SITE_URL` and `BASE_PATH=/` in the deploy workflow, and update `Canonical` in `public/.well-known/security.txt`, which will then sit at the RFC 9116 root location.

## Residual risks

- **A compromised maintainer account or a malicious merge** can publish anything. Controls are procedural (rulesets, review, MFA) and must be configured in GitHub.
- **Supply chain.** About 314 build-time packages are trusted at build time. The lockfile, integrity hashes, disabled install scripts, a cooldown and pinned actions reduce but do not remove this risk: package code still runs during `astro build`.
- **Framing and header-level protections** are unavailable on GitHub Pages (above).
- **Outbound links** go to external sites ASE does not control; a cited site can later be compromised or change content. Citations are links, never embeds, and the site does not vouch for linked files.
- **`style-src-attr 'unsafe-inline'`** permits inline style attributes. Injected markup would already have to bypass Astro escaping and `check-security`, and CSS alone cannot run script.
- **Browser support.** CSP Level 3 split directives need current browsers; older ones fall back to `style-src 'self' 'unsafe-inline'`.
- **Checks are pattern-based.** `check-security` catches known dangerous constructs in the output. It does not prove the absence of vulnerabilities.
