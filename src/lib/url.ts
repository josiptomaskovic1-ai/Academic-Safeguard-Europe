// Base-path aware internal links (GitHub Pages serves the site under /<repo>/).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(p = '/'): string {
  const [pathPart, hash] = p.split('#');
  let clean = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  if (!clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) clean += '/';
  return `${BASE}${clean}${hash ? `#${hash}` : ''}`;
}

// Same rule as isUrl in scripts/validate-data.mjs, enforced again at render time so a data URL can never become
// a javascript:/data: link even when `astro build` or `astro dev` runs without validation. Fails the build rather
// than silently dropping a citation. No whitespace, control or bidi characters, no userinfo, http(s) only.
const UNSAFE_URL_CHARS = /[\u0000-\u0020\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/;
export function externalUrl(u: unknown): string {
  if (typeof u === 'string' && !UNSAFE_URL_CHARS.test(u) && URL.canParse(u)) {
    const x = new URL(u);
    if ((x.protocol === 'https:' || x.protocol === 'http:') && !x.username && !x.password && x.hostname.includes('.')) return u;
  }
  throw new Error(`Refusing to render unsafe external URL ${JSON.stringify(u)}. Run npm run validate-data.`);
}

// Private contact for corrections and right of reply. Set by the maintainer; never invent an address.
// While null, the site states honestly that GitHub is the only route.
export const CONTACT_EMAIL: string | null = null;

export const REPO_URL = 'https://github.com/josiptomaskovic1-ai/Academic-Safeguard-Europe';
export const repoFile = (p: string) => `${REPO_URL}/blob/main/${p.replace(/^\//, '')}`;
export const repoTree = (p: string) => `${REPO_URL}/tree/main/${p.replace(/^\//, '')}`;
export const newIssue = (template: string, title = '') =>
  `${REPO_URL}/issues/new?template=${encodeURIComponent(template)}${title ? `&title=${encodeURIComponent(title)}` : ''}`;
