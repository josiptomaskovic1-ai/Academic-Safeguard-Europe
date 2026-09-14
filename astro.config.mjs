// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site. Override with SITE_URL / BASE_PATH for a custom domain.
const site = process.env.SITE_URL ?? 'https://josiptomaskovic1-ai.github.io';
const base = process.env.BASE_PATH ?? '/Academic-Safeguard-Europe';

/**
 * Markdown tables (Standard, methodology, changelog) get the same scrollable, keyboard-focusable,
 * labelled wrapper as the site's own tables, so they never widen the page on phones.
 * A few lines of tree walking, no dependency. The label is the nearest preceding heading.
 * @returns {(tree: any) => void}
 */
function rehypeTableRegions() {
  return (tree) => {
    let lastHeading = 'Table';
    const text = (/** @type {any} */ n) => (n.type === 'text' ? n.value : (n.children ?? []).map(text).join(''));
    const walk = (/** @type {any} */ node) => {
      if (!node.children) return;
      node.children = node.children.map((/** @type {any} */ child) => {
        if (child.type === 'element' && /^h[1-6]$/.test(child.tagName)) lastHeading = text(child).trim() || lastHeading;
        if (child.type === 'element' && child.tagName === 'table') {
          return { type: 'element', tagName: 'div', properties: { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: `Table: ${lastHeading}` }, children: [child] };
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { rehypePlugins: [rehypeTableRegions] },
  // Emit every client script as a file so the CSP can use script-src 'self' without inline hashes.
  vite: { build: { assetsInlineLimit: 0 } },
});
