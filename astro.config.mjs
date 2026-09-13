// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site. Override with SITE_URL / BASE_PATH for a custom domain.
const site = process.env.SITE_URL ?? 'https://josiptomaskovic1-ai.github.io';
const base = process.env.BASE_PATH ?? '/Academic-Safeguard-Europe';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
