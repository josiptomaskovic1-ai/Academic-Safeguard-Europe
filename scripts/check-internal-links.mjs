#!/usr/bin/env node
// Checks that every internal link and in-page anchor in the built site resolves. Run after `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH ?? '/Academic-Safeguard-Europe').replace(/\/$/, '');

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
})(DIST);

const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
};
const resolve = (p) => {
  const rel = decodeURIComponent(p.slice(BASE.length)) || '/';
  const candidates = [path.join(DIST, rel), path.join(DIST, rel, 'index.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
};

const broken = [];
let checked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(href)) continue;
    checked++;
    const [p, hash] = href.split('#');
    const target = p === '' ? file : p.startsWith(BASE) ? resolve(p) : undefined;
    if (!target) {
      broken.push(`${path.relative(DIST, file)} → ${href}`);
      continue;
    }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) broken.push(`${path.relative(DIST, file)} → ${href} (missing anchor)`);
  }
}
if (broken.length) {
  console.error(`${broken.length} broken internal link(s):`);
  for (const b of [...new Set(broken)]) console.error(`  ✖ ${b}`);
  process.exit(1);
}
console.log(`Checked ${checked} internal links across ${htmlFiles.length} pages. All resolve.`);
