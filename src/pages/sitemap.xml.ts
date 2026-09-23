import type { APIRoute } from 'astro';
import { getCountries, getInstitutions, getRubric } from '../lib/data';
import { url } from '../lib/url';

/**
 * Build-time sitemap. Hand-rolled rather than adding @astrojs/sitemap: the route set is
 * small and fully derivable from the same data the pages are built from, and this keeps
 * the dependency list (and the audit surface) unchanged.
 *
 * Every entry is an absolute URL built from Astro.site plus the configured base path, so
 * it stays correct if the site ever moves to its own domain.
 */
const STATIC_ROUTES = [
  '/',
  '/about/',
  '/problem/',
  '/demands/',
  '/take-action/',
  '/contribute/',
  '/standard/',
  '/methodology/',
  '/methodology/changelog/',
  '/evidence/',
  '/evidence/library/',
  '/europe/',
  '/institutions/',
  '/compare/',
  '/sources/',
  '/data/',
  '/corrections/',
];

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('sitemap.xml: `site` is not configured in astro.config.mjs');

  const paths = [
    ...STATIC_ROUTES,
    ...getCountries().map((c) => `/countries/${c.slug}/`),
    ...getInstitutions().map((i) => `/institutions/${i.id}/`),
    ...getRubric().safeguards.map((s) => `/compare/${s.slug}/`),
  ];

  // De-duplicate defensively: a route added to both lists must not appear twice.
  const seen = new Set<string>();
  const entries = paths
    .filter((p) => (seen.has(p) ? false : (seen.add(p), true)))
    .map((p) => `  <url><loc>${new URL(url(p), site).href}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
