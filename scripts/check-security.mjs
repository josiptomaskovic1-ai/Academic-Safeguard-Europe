#!/usr/bin/env node
// Security regression checks for the built site and the repository. Run after `npm run build`.
// Errors fail CI and deploy. Findings are deliberately narrow: each check guards a concrete way the static site
// could execute or load something it should not, or leak build details. It is not a substitute for review.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH ?? '/Academic-Safeguard-Europe').replace(/\/$/, '');

// Must match the production policy built in src/layouts/Base.astro.
const EXPECTED_CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests";
// The only components allowed to use set:html, each with constant SVG markup.
const SET_HTML_ALLOWED = new Set(['src/components/SafeguardIcon.astro', 'src/components/ScopeIcon.astro', 'src/components/DocTypeIcon.astro', 'src/components/WorkflowDiagram.astro']);

const errors = [];
const notes = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

// ---------- detectors (pure functions, self-tested below) ----------
const NAMED = { colon: ':', tab: '\t', newline: '\n', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', sol: '/', period: '.', lpar: '(', rpar: ')' };
const decodeEntities = (s) => s
  .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
/** Scheme as a browser would see it: entities decoded, control chars and whitespace removed. */
const schemeOf = (raw) => {
  const v = decodeEntities(raw).replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const m = /^([a-z][a-z0-9+.-]*):/i.exec(v);
  return m ? m[1].toLowerCase() : null;
};
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'xlink:href', 'poster', 'data', 'cite', 'background', 'ping', 'srcset', 'manifest']);
const tagsOf = (html) => [...html.matchAll(/<([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g)]
  .map((m) => ({ name: m[1].toLowerCase(), raw: m[0], attrs: [...m[2].matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)].map((a) => ({ name: a[1].toLowerCase(), value: a[2] ?? a[3] ?? a[4] ?? '' })) }));

/** Returns problems for one HTML document. `opts.http` collects plain-http citation links (not errors). */
function checkHtml(html, opts = {}) {
  const out = [];
  const tags = tagsOf(html);
  const attr = (t, n) => t.attrs.find((a) => a.name === n)?.value;
  for (const t of tags) {
    for (const a of t.attrs) {
      if (/^on[a-z]+$/.test(a.name)) out.push(`inline event handler ${a.name}= on <${t.name}>`);
      if (URL_ATTRS.has(a.name) || (a.name === 'content' && /refresh/i.test(attr(t, 'http-equiv') ?? ''))) {
        const values = a.name === 'srcset' ? a.value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [a.value];
        for (const v of values) {
          const scheme = schemeOf(v);
          if (scheme && !['https', 'http', 'mailto'].includes(scheme)) out.push(`disallowed URL scheme "${scheme}:" in ${a.name} on <${t.name}>`);
          if (scheme === 'mailto' && !(t.name === 'a' && a.name === 'href')) out.push(`mailto: outside a link on <${t.name}>`);
          if (scheme === 'http' && t.name === 'a' && a.name === 'href') opts.http?.push(v);
          const subresource = !(t.name === 'a' && a.name === 'href') && !(t.name === 'link' && /^(canonical|alternate)$/i.test(attr(t, 'rel') ?? ''));
          if (subresource && (scheme || /^\s*\/\//.test(v))) out.push(`external or non-local resource ${a.name}="${v}" on <${t.name}>`);
        }
      }
      if (a.name === 'style' && /url\s*\(|expression\s*\(|@import/i.test(decodeEntities(a.value))) out.push(`style attribute loads or evaluates content on <${t.name}>`);
    }
    if (['iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'base', 'portal', 'foreignobject'].includes(t.name)) out.push(`forbidden element <${t.name}>`);
    if (t.name === 'meta' && /refresh/i.test(attr(t, 'http-equiv') ?? '')) out.push('meta refresh redirect');
    if (t.name === 'form' && attr(t, 'action') !== undefined) out.push('form with an action (the site has no submission endpoints)');
    if (t.name === 'script' && attr(t, 'src') === undefined) out.push('inline <script> (blocked by CSP; ship it as a file)');
    if (t.name === 'style') out.push('inline <style> element (blocked by CSP style-src-elem)');
    if (t.name === 'a' && /_blank/i.test(attr(t, 'target') ?? '')) {
      const rel = (attr(t, 'rel') ?? '').toLowerCase().split(/\s+/);
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) out.push(`target="_blank" without rel="noopener noreferrer": ${t.raw.slice(0, 120)}`);
    }
  }
  return { out, tags };
}
const DOM_SINKS = /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|document\.write|\beval\s*\(|new\s+Function\s*\(|set(Timeout|Interval)\s*\(\s*['"`]|createContextualFragment|srcdoc/;
const LOCAL_PATHS = /[A-Za-z]:\\\\?(Users|Windows|runner)\b|\/Users\/[A-Za-z]|\/home\/(runner|[a-z]+\/)|file:\/\/\//;
const SVG_UNSAFE = /<script|<foreignObject|\son[a-z]+\s*=|(xlink:)?href\s*=\s*["']\s*(?!#)[a-z]+:/i;

// ---------- self-test: every detector must catch a known-bad sample ----------
const mustFlag = [
  '<a href="javascript:alert(1)">x</a>',
  '<a href="&#106;avascript:alert(1)">x</a>',
  '<a href="java&#x09;script:alert(1)">x</a>',
  '<a href=" JavaScript&colon;alert(1)">x</a>',
  '<a href="data:text/html,<script>alert(1)</script>">x</a>',
  '<img src="https://evil.example/p.png">',
  '<script src="//evil.example/x.js"></script>',
  '<script>alert(1)</script>',
  '<div onclick="x()">x</div>',
  '<svg><a xlink:href="javascript:alert(1)">x</a></svg>',
  '<a href="https://example.org/" target="_blank" rel="noopener">x</a>',
  '<iframe src="/x"></iframe>',
  '<meta http-equiv="refresh" content="0;url=https://evil.example/">',
  '<base href="https://evil.example/">',
  '<span style="background:url(https://evil.example/t)">x</span>',
];
const mustPass = [
  `<a href="${BASE}/sources/#hr-zvozd-2022">x</a>`,
  '<a href="https://narodne-novine.nn.hr/clanci/sluzbeni/2022_10_119_1834.html" rel="noopener">x</a>',
  '<a href="https://example.org/" target="_blank" rel="noopener noreferrer">x</a>',
  `<link rel="canonical" href="https://josiptomaskovic1-ai.github.io${BASE}/">`,
  '<span style="width:1.25rem;height:1.25rem">x</span>',
  '<p>Text mentioning onclick= and javascript: in prose is not markup.</p>',
];
for (const s of mustFlag) if (!checkHtml(s).out.length) fail('self-test', `detector missed: ${s}`);
for (const s of mustPass) if (checkHtml(s).out.length) fail('self-test', `false positive: ${s} → ${checkHtml(s).out}`);
if (!DOM_SINKS.test('el.innerHTML = x') || !DOM_SINKS.test('document.write(x)')) fail('self-test', 'DOM sink detector broken');
if (!SVG_UNSAFE.test('<svg onload="x()">') || SVG_UNSAFE.test('<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>')) fail('self-test', 'SVG detector broken');
if (!LOCAL_PATHS.test('C:\\Users\\someone\\x') || !LOCAL_PATHS.test('/home/runner/work')) fail('self-test', 'local path detector broken');

// ---------- built output ----------
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const relDist = (f) => path.relative(DIST, f).replaceAll('\\', '/');
if (!fs.existsSync(DIST)) {
  fail('dist', 'not found. Run `npm run build` first.');
} else {
  const files = walk(DIST);
  const http = [];
  let pages = 0;
  for (const f of files) {
    const where = relDist(f);
    if (f.endsWith('.map')) fail(where, 'source map published');
    const ext = path.extname(f);
    if (!['.html', '.js', '.css', '.svg', '.json', '.txt', '.woff2', ''].includes(ext)) notes.push(`${where}: unexpected published file type`);
    if (!['.html', '.js', '.css', '.svg', '.json', '.txt'].includes(ext)) continue;
    const body = fs.readFileSync(f, 'utf8');
    if (LOCAL_PATHS.test(body)) fail(where, `local filesystem path in output: …${body.match(LOCAL_PATHS)[0]}…`);
    if (/sourceMappingURL=/.test(body)) fail(where, 'sourceMappingURL reference');
    if (ext === '.js' && DOM_SINKS.test(body)) fail(where, `dangerous DOM/eval sink: ${body.match(DOM_SINKS)[0]}`);
    if (ext === '.css' && /@import|url\s*\(\s*['"]?\s*(https?:|\/\/|data:|javascript:)/i.test(body)) fail(where, 'stylesheet loads external or data: content');
    if (ext === '.svg' && SVG_UNSAFE.test(body)) fail(where, 'SVG contains script, foreignObject, event handler or external reference');
    if (ext !== '.html') continue;
    pages++;
    const { out, tags } = checkHtml(body, { http });
    for (const p of out) fail(where, p);
    const csps = tags.filter((t) => t.name === 'meta' && /^content-security-policy$/i.test(t.attrs.find((a) => a.name === 'http-equiv')?.value ?? ''));
    const cspValue = csps[0] && decodeEntities(csps[0].attrs.find((a) => a.name === 'content')?.value ?? '');
    if (csps.length !== 1) fail(where, `expected exactly one CSP meta tag, found ${csps.length}`);
    else if (cspValue !== EXPECTED_CSP) fail(where, `CSP differs from the reviewed policy: "${cspValue}"`);
    else {
      // A meta CSP only governs content after it, so it must precede every script and stylesheet.
      const cspAt = body.indexOf(csps[0].raw);
      const firstLoad = body.search(/<script|<link[^>]+rel="?(stylesheet|icon)/i);
      if (firstLoad !== -1 && firstLoad < cspAt) fail(where, 'CSP meta appears after a script or stylesheet');
    }
    if (!tags.some((t) => t.name === 'meta' && t.attrs.some((a) => a.name === 'name' && a.value === 'referrer') && t.attrs.some((a) => a.name === 'content' && a.value === 'no-referrer'))) fail(where, 'missing <meta name="referrer" content="no-referrer">');
    for (const t of tags) {
      const src = t.name === 'script' ? t.attrs.find((a) => a.name === 'src')?.value : undefined;
      if (src !== undefined && !src.startsWith(`${BASE}/`)) fail(where, `script not served from the site: ${src}`);
    }
  }
  if (pages === 0) fail('dist', 'no HTML pages found');
  const uniqueHttp = [...new Set(http)];
  if (uniqueHttp.length) notes.push(`${uniqueHttp.length} plain-http citation link(s) (navigation only, not loaded resources): ${uniqueHttp.join(', ')}`);
  notes.push(`Scanned ${files.length} built files (${pages} pages).`);
}

// ---------- repository ----------
let tracked = [];
try {
  tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' }).split('\0').filter(Boolean);
} catch {
  notes.push('git not available: tracked-file checks skipped, scanning working tree sources only.');
}
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const sourceFiles = [...new Set([...tracked, ...['src', 'public', 'scripts', '.github'].filter(exists).flatMap((d) => walk(path.join(ROOT, d)).map((f) => path.relative(ROOT, f).replaceAll('\\', '/')))])]
  .filter(exists);

const SECRET_FILES = /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|.*\.p12|.*\.pfx|id_(rsa|ed25519|ecdsa)|\.npmrc\.local|credentials(\.json)?)$/i;
const SECRETS = /(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abprs]-[A-Za-z0-9-]{10,}|npm_[A-Za-z0-9]{36}|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9_-]{32,})/;
for (const f of sourceFiles) {
  if (SECRET_FILES.test(f) && !/\.example$/.test(f)) fail(f, 'secret-like file is tracked or present in sources');
  if (/\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf)$/i.test(f) || f.startsWith('node_modules/')) continue;
  const body = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (SECRETS.test(body) && f !== 'scripts/check-security.mjs') fail(f, 'looks like a credential or private key; revoke it (git history keeps it) before removing');
  if (/\.(astro|ts|js|mjs)$/.test(f) && (f.startsWith('src/') || f.startsWith('public/'))) {
    if (/set:html/.test(body) && !SET_HTML_ALLOWED.has(f)) fail(f, 'set:html outside the reviewed icon components; render data as text');
    if (/define:vars/.test(body)) fail(f, 'define:vars (inlines script, blocked by CSP and has had XSS advisories)');
    if (DOM_SINKS.test(body)) fail(f, `dangerous DOM/eval sink: ${body.match(DOM_SINKS)[0]}`);
    if (/<script\b[^>]*\bis:inline\b(?![^>]*\bsrc=)[^>]*>/.test(body)) fail(f, 'inline script body (is:inline without src)');
  }
  if (f.endsWith('.svg') && SVG_UNSAFE.test(body)) fail(f, 'SVG contains script, foreignObject, event handler or external reference');
}

for (const wf of sourceFiles.filter((f) => /^\.github\/workflows\/.+\.ya?ml$/.test(f))) {
  // Comments are dropped (not a full YAML parse): a `#` inside a quoted value is not used in these workflows.
  const body = fs.readFileSync(path.join(ROOT, wf), 'utf8').replace(/(^|\s)#.*$/gm, '$1');
  if (!/^permissions:/m.test(body)) fail(wf, 'no top-level permissions block');
  if (/pull_request_target|workflow_run/.test(body)) fail(wf, 'privileged trigger (pull_request_target/workflow_run) runs untrusted code with secrets');
  for (const [, ref] of body.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)) {
    if (!ref.startsWith('./') && !/@[0-9a-f]{40}$/.test(ref)) fail(wf, `action not pinned to a full commit SHA: ${ref}`);
  }
  if (/\$\{\{\s*github\.event\.(pull_request|issue|comment|head_commit|review)[^}]*\}\}/.test(body)) fail(wf, 'untrusted event data interpolated into the workflow (script injection)');
}

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/^﻿/, ''));
const pkg = readJson('package.json');
for (const hook of ['preinstall', 'install', 'postinstall', 'prepare', 'prepublish', 'preprepare', 'postprepare']) if (pkg.scripts?.[hook]) fail('package.json', `lifecycle script "${hook}" runs on install`);
if (!/^\s*ignore-scripts\s*=\s*true\s*$/m.test(exists('.npmrc') ? fs.readFileSync(path.join(ROOT, '.npmrc'), 'utf8') : '')) fail('.npmrc', 'ignore-scripts=true missing (dependency install scripts would run)');
if (!exists('package-lock.json')) fail('package-lock.json', 'missing; CI must install from a committed lockfile');
else {
  const lock = readJson('package-lock.json');
  for (const [name, p] of Object.entries(lock.packages ?? {})) {
    if (!name || p.link) continue;
    if (!p.resolved?.startsWith('https://registry.npmjs.org/')) fail('package-lock.json', `${name} not resolved from the npm registry: ${p.resolved}`);
    if (!p.integrity?.startsWith('sha512-')) fail('package-lock.json', `${name} has no sha512 integrity`);
  }
}

// ---------- report ----------
for (const n of notes) console.log(`  · ${n}`);
if (errors.length) {
  console.error(`\n${errors.length} security check failure(s):`);
  for (const e of [...new Set(errors)]) console.error(`  ✖ ${e}`);
  process.exit(1);
}
console.log('Security checks passed.');
