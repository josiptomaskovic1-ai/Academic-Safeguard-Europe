// Base-path aware internal links (GitHub Pages serves the site under /<repo>/).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(p = '/'): string {
  const [pathPart, hash] = p.split('#');
  let clean = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  if (!clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) clean += '/';
  return `${BASE}${clean}${hash ? `#${hash}` : ''}`;
}

export const REPO_URL = 'https://github.com/josiptomaskovic1-ai/Academic-Safeguard-Europe';
export const repoFile = (p: string) => `${REPO_URL}/blob/main/${p.replace(/^\//, '')}`;
export const repoTree = (p: string) => `${REPO_URL}/tree/main/${p.replace(/^\//, '')}`;
export const newIssue = (template: string, title = '') =>
  `${REPO_URL}/issues/new?template=${encodeURIComponent(template)}${title ? `&title=${encodeURIComponent(title)}` : ''}`;
