#!/usr/bin/env node
// Validates all research data. Errors fail the build; warnings are reported only.
// Usage: npm run validate-data   (add --strict to treat warnings as errors)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');
const STALE_DAYS = 365;

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);
const rel = (f) => path.relative(ROOT, f).replaceAll('\\', '/');

function load(file) {
  try {
    return YAML.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    err(file, `YAML parse error: ${e.message}`);
    return null;
  }
}
const ymlFiles = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? ymlFiles(p) : /\.ya?ml$/.test(d.name) ? [p] : [];
      })
    : [];

// ---------- reference data ----------
const EU27 = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
const SUPRA = new Set(['EU', 'EHEA', 'INT', 'COE']);
const RESULTS = new Set(['NR', '?', '0', '1', '2', '3']);
const VERIFICATION = new Set(['verified', 'needs_review', 'disputed']);
const CONFIDENCE = new Set(['high', 'medium', 'low']);
const COUNTRY_STATUS = new Set(['not_researched', 'research_underway', 'partially_researched', 'national_framework_reviewed', 'institution_research_available']);
const INSTITUTION_STATUS = new Set(['research_underway', 'partially_researched', 'researched']);
const INSTITUTION_TYPES = new Set(['public_university', 'private_university', 'university_of_applied_sciences', 'polytechnic', 'other']);
const DOC_TYPES = new Set(['legislation', 'regulation', 'statute', 'policy', 'code_of_ethics', 'procedure', 'guidance', 'report', 'standard', 'other']);
const EVIDENCE_CATEGORIES = new Set(['academic-authority', 'retaliation', 'student-rights', 'doctoral-supervision', 'harassment', 'bullying', 'professional-boundaries', 'academic-freedom', 'institutional-accountability', 'complaint-procedures', 'ombuds-systems', 'conflicts-of-interest', 'quality-assurance', 'academic-harm', 'remediation']);
const EVIDENCE_TYPES = new Set(['legislation', 'standard', 'policy', 'guidance', 'report', 'research', 'code_of_conduct', 'network', 'other']);
const CORRECTION_TYPES = new Set(['factual_correction', 'methodology_disagreement', 'new_source', 'broken_link']);
const CORRECTION_STATUS = new Set(['open', 'under_review', 'accepted', 'partially_accepted', 'not_accepted']);
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PARTIAL_DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

// Rendered as hrefs, so reject anything that could disguise the real destination:
// non-web schemes, userinfo ("https://trusted.example@evil.example/"), whitespace, control and bidi characters.
const UNSAFE_URL_CHARS = /[\u0000-\u0020\u007f-\u009f\u200e\u200f\u202a-\u202e\u2066-\u2069]/;
const isUrl = (u) => {
  if (typeof u !== 'string' || UNSAFE_URL_CHARS.test(u)) return false;
  try {
    const x = new URL(u);
    return (x.protocol === 'https:' || x.protocol === 'http:') && !x.username && !x.password && x.hostname.includes('.');
  } catch {
    return false;
  }
};
// Valid but worth a reviewer's attention: unencrypted links and internationalised (punycode) hostnames.
const checkUrlWarnings = (file, where, u) => {
  if (!isUrl(u)) return;
  const x = new URL(u);
  if (x.protocol === 'http:') warn(file, `${where}: insecure http: URL "${u}" (use https: where available)`);
  if (x.hostname.split('.').some((l) => l.startsWith('xn--'))) warn(file, `${where}: internationalised hostname "${x.hostname}", check it is not a look-alike domain`);
};
const DOI_RE = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
const DOSSIER_RE = /^research\/(pending|verified|disputed)\/[a-z0-9-]+\.ya?ml$/;
const checkDossier = (file, v) => {
  if (v == null) return;
  if (typeof v !== 'string' || !DOSSIER_RE.test(v) || !fs.existsSync(path.join(ROOT, v))) err(file, `invalid research_dossier "${v}" (must be an existing research/{pending,verified,disputed}/<name>.yml file)`);
};
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const dateStr = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v);
const validDate = (v) => {
  v = dateStr(v);
  return typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(v));
};
const daysSince = (v) => (Date.now() - Date.parse(dateStr(v))) / 86_400_000;

// ---------- rubric ----------
const rubricFile = path.join(ROOT, 'methodology/scoring-rubric.yml');
const rubric = load(rubricFile);
if (!rubric) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const SAFEGUARDS = new Set(rubric.safeguards.map((s) => s.id));
const METHOD_VERSIONS = new Set([String(rubric.methodology_version)]);
for (const s of rubric.safeguards) {
  for (const lvl of ['0', '1', '2', '3']) if (!str(s.levels?.[lvl])) err(rubricFile, `${s.id} missing level ${lvl} definition`);
}
for (const v of rubric.result_values.map((r) => r.value)) if (!RESULTS.has(String(v))) err(rubricFile, `unknown result value ${v}`);

// ---------- sources ----------
const sources = new Map();
for (const file of ymlFiles(path.join(ROOT, 'data/sources'))) {
  const doc = load(file);
  if (!doc) continue;
  if (!Array.isArray(doc.sources)) {
    err(file, '"sources" must be a list');
    continue;
  }
  for (const s of doc.sources) {
    const where = `source ${s?.id ?? '(no id)'}`;
    if (!str(s.id) || !ID_RE.test(s.id)) err(file, `${where}: invalid or missing id`);
    else if (sources.has(s.id)) err(file, `${where}: duplicated source ID (also in ${rel(sources.get(s.id).file)})`);
    else sources.set(s.id, { ...s, file });
    for (const f of ['title', 'issuing_body', 'language']) if (!str(s[f])) err(file, `${where}: missing ${f}`);
    if (!isUrl(s.url)) err(file, `${where}: malformed URL "${s.url}"`);
    checkUrlWarnings(file, where, s.url);
    if (!DOC_TYPES.has(s.document_type)) err(file, `${where}: invalid document_type "${s.document_type}"`);
    if (!EU27.has(s.country) && !SUPRA.has(s.country)) err(file, `${where}: invalid country "${s.country}"`);
    if (!validDate(s.accessed)) err(file, `${where}: accessed must be YYYY-MM-DD`);
    if (s.publication_date == null) warn(file, `${where}: missing publication date`);
    else if (!PARTIAL_DATE_RE.test(String(dateStr(s.publication_date)))) err(file, `${where}: malformed publication_date`);
    if (s.archived_url == null) warn(file, `${where}: missing archived link`);
    else if (!isUrl(s.archived_url)) err(file, `${where}: malformed archived_url`);
    else checkUrlWarnings(file, `${where} archived_url`, s.archived_url);
  }
}

// ---------- safeguard results ----------
function checkResults(file, safeguards, { label }) {
  const counts = { nonNR: 0 };
  if (!safeguards || typeof safeguards !== 'object') {
    err(file, 'missing "safeguards" map');
    return counts;
  }
  for (const key of Object.keys(safeguards)) if (!SAFEGUARDS.has(key)) err(file, `unknown safeguard ID "${key}"`);
  for (const id of SAFEGUARDS) {
    const r = safeguards[id];
    const where = `${label} ${id}`;
    if (!r) {
      err(file, `${where}: missing (use result "NR" if not researched)`);
      continue;
    }
    const result = r.result;
    if (typeof result !== 'string') {
      err(file, `${where}: result must be a quoted string, got ${JSON.stringify(result)}`);
      continue;
    }
    if (!RESULTS.has(result)) {
      err(file, `${where}: invalid safeguard score "${result}"`);
      continue;
    }
    if (result === 'NR') {
      const extra = Object.keys(r).filter((k) => !['result', 'notes'].includes(k));
      if (extra.length) err(file, `${where}: NR result must not carry findings (${extra.join(', ')})`);
      continue;
    }
    counts.nonNR++;
    if (!VERIFICATION.has(r.verification)) err(file, `${where}: invalid or missing verification status`);
    if (!Array.isArray(r.source_ids) || r.source_ids.length === 0) err(file, `${where}: score without required evidence (no source_ids)`);
    for (const sid of r.source_ids ?? []) if (!sources.has(sid)) err(file, `${where}: missing source ID "${sid}"`);
    if (!str(r.rationale)) err(file, `${where}: missing rationale`);
    if (!validDate(r.reviewed)) err(file, `${where}: reviewed must be YYYY-MM-DD`);
    else if (daysSince(r.reviewed) > STALE_DAYS) warn(file, `${where}: stale review date (${dateStr(r.reviewed)})`);
    if (['1', '2', '3'].includes(result)) {
      if (!str(r.evidence)) err(file, `${where}: score without required evidence (missing evidence)`);
      if (!str(r.locator)) err(file, `${where}: missing locator (article/section/page)`);
      if (!CONFIDENCE.has(r.confidence)) err(file, `${where}: invalid or missing confidence`);
    } else {
      if (!Array.isArray(r.sources_reviewed) || r.sources_reviewed.length === 0) err(file, `${where}: result "${result}" requires sources_reviewed`);
      for (const sid of r.sources_reviewed ?? []) if (!sources.has(sid)) err(file, `${where}: sources_reviewed references unknown source "${sid}"`);
      if (r.confidence != null && !CONFIDENCE.has(r.confidence)) err(file, `${where}: invalid confidence`);
    }
    if (r.confidence === 'low') warn(file, `${where}: low-confidence finding`);
    // scoring-rubric.yml: a "0" "requires secondary verification before publication". Surface every conflict for the maintainer.
    if (result === '0' && r.verification !== 'verified') warn(file, `${where}: result "0" is published without secondary verification (rubric requires it before publication)`);
    if (r.verification === 'verified' && !str(r.second_reviewer)) err(file, `${where}: verified finding must record second_reviewer`);
    if (r.verification === 'disputed' && !(Array.isArray(r.dispute_ids) && r.dispute_ids.length)) err(file, `${where}: disputed result must list dispute_ids`);
  }
  return counts;
}

// ---------- countries ----------
const countries = new Map();
const countryFiles = ymlFiles(path.join(ROOT, 'data/countries'));
for (const file of countryFiles) {
  const c = load(file);
  if (!c) continue;
  const label = c.iso_code ?? path.basename(file);
  if (!EU27.has(c.iso_code)) err(file, `invalid ISO code "${c.iso_code}"`);
  else if (countries.has(c.iso_code)) err(file, `duplicate country ${c.iso_code}`);
  else countries.set(c.iso_code, { ...c, file });
  if (c.slug !== path.basename(file, path.extname(file))) err(file, `slug "${c.slug}" does not match file name`);
  for (const f of ['name', 'local_name']) if (!str(c[f])) err(file, `missing ${f}`);
  if (c.eu_status !== 'member_state') err(file, 'eu_status must be member_state');
  if (!Number.isInteger(c.eu_accession_year)) err(file, 'eu_accession_year must be an integer');
  if (c.methodology_version == null) err(file, 'missing methodology version');
  else if (!METHOD_VERSIONS.has(String(c.methodology_version))) err(file, `unknown methodology version "${c.methodology_version}"`);
  if (!COUNTRY_STATUS.has(c.research_status)) err(file, `invalid research status "${c.research_status}"`);
  if (c.confidence != null && !CONFIDENCE.has(c.confidence)) err(file, 'invalid confidence');
  checkDossier(file, c.research_dossier);
  const { nonNR } = checkResults(file, c.safeguards, { label });
  if (nonNR > 0 && c.research_status === 'not_researched') err(file, 'has findings but research_status is not_researched');
  if (nonNR > 0 && !validDate(c.last_reviewed)) err(file, 'has findings but last_reviewed is missing');
  if (c.last_reviewed != null && !validDate(c.last_reviewed)) err(file, 'last_reviewed must be YYYY-MM-DD');
}
const missing = [...EU27].filter((iso) => !countries.has(iso));
if (missing.length) errors.push(`data/countries: missing Member State records: ${missing.join(', ')}`);

// ---------- institutions ----------
const institutions = new Map();
for (const file of ymlFiles(path.join(ROOT, 'data/institutions'))) {
  const i = load(file);
  if (!i) continue;
  const label = i.id ?? path.basename(file);
  const dir = path.basename(path.dirname(file));
  if (!str(i.id) || !ID_RE.test(i.id)) err(file, 'invalid id');
  else if (institutions.has(i.id)) err(file, `duplicate institution ${i.id}`);
  else institutions.set(i.id, i);
  if (!countries.has(i.country)) err(file, `institution with unknown country "${i.country}"`);
  if (dir !== String(i.country).toLowerCase()) err(file, `must live in data/institutions/${String(i.country).toLowerCase()}/`);
  if (str(i.id) && !i.id.startsWith(`${String(i.country).toLowerCase()}-`)) err(file, 'id must start with lowercase country code');
  if (!str(i.canonical_name)) err(file, 'missing canonical_name');
  if (!isUrl(i.website)) err(file, `malformed URL "${i.website}"`);
  checkUrlWarnings(file, 'website', i.website);
  checkDossier(file, i.research_dossier);
  if (!INSTITUTION_TYPES.has(i.institution_type)) err(file, `invalid institution_type "${i.institution_type}"`);
  if (!INSTITUTION_STATUS.has(i.research_status)) err(file, `invalid research status "${i.research_status}"`);
  if (i.methodology_version == null) err(file, 'missing methodology version');
  else if (!METHOD_VERSIONS.has(String(i.methodology_version))) err(file, `unknown methodology version "${i.methodology_version}"`);
  if (!validDate(i.last_reviewed)) err(file, 'last_reviewed must be YYYY-MM-DD');
  if (!['none', 'open', 'resolved'].includes(i.correction_status)) err(file, 'invalid correction_status');
  for (const r of i.replies ?? []) {
    if (!validDate(r.received) || !str(r.submitted_by) || !str(r.text)) err(file, 'reply needs received (YYYY-MM-DD), submitted_by and text');
    else if (r.text.trim().split(/\s+/).length > 300) err(file, 'statement of reply exceeds 300 words');
  }
  checkResults(file, i.safeguards, { label });
}
for (const [iso, c] of countries) {
  for (const id of c.institutions_researched ?? []) {
    const inst = institutions.get(id);
    if (!inst) err(c.file, `institutions_researched references unknown institution "${id}"`);
    else if (inst.country !== iso) err(c.file, `institution "${id}" belongs to ${inst.country}`);
  }
}
for (const [id, s] of sources) {
  if (s.institution != null && !institutions.has(s.institution)) err(s.file, `source ${id}: unknown institution "${s.institution}"`);
}

// ---------- evidence library ----------
const libFile = path.join(ROOT, 'evidence-library/items.yml');
if (fs.existsSync(libFile)) {
  const lib = load(libFile);
  const seen = new Set();
  for (const it of lib?.items ?? []) {
    const where = `item ${it.id ?? '(no id)'}`;
    if (!str(it.id) || !ID_RE.test(it.id)) err(libFile, `${where}: invalid id`);
    else if (seen.has(it.id)) err(libFile, `${where}: duplicated id`);
    seen.add(it.id);
    for (const f of ['title', 'author_body', 'jurisdiction', 'summary']) if (!str(it[f])) err(libFile, `${where}: missing ${f}`);
    if (!isUrl(it.url)) err(libFile, `${where}: malformed URL`);
    checkUrlWarnings(libFile, where, it.url);
    if (it.doi != null && !(typeof it.doi === 'string' && DOI_RE.test(it.doi))) err(libFile, `${where}: malformed doi "${it.doi}"`);
    if (!EVIDENCE_TYPES.has(it.source_type)) err(libFile, `${where}: invalid source_type "${it.source_type}"`);
    if (!Array.isArray(it.categories) || !it.categories.length) err(libFile, `${where}: needs at least one category`);
    for (const cat of it.categories ?? []) if (!EVIDENCE_CATEGORIES.has(cat)) err(libFile, `${where}: unknown category "${cat}"`);
    if (it.year != null && !Number.isInteger(it.year)) err(libFile, `${where}: year must be integer or null`);
  }
}

// ---------- corrections ----------
const corrFile = path.join(ROOT, 'data/corrections.yml');
const correctionIds = new Set();
if (fs.existsSync(corrFile)) {
  const doc = load(corrFile);
  for (const c of doc?.corrections ?? []) {
    const where = `correction ${c.id ?? '(no id)'}`;
    if (!/^C-\d{4}-\d{3}$/.test(c.id ?? '')) err(corrFile, `${where}: id must look like C-2026-001`);
    if (correctionIds.has(c.id)) err(corrFile, `${where}: duplicated id`);
    correctionIds.add(c.id);
    if (!CORRECTION_TYPES.has(c.type)) err(corrFile, `${where}: invalid type`);
    if (!CORRECTION_STATUS.has(c.status)) err(corrFile, `${where}: invalid status`);
    if (!validDate(c.received)) err(corrFile, `${where}: received must be YYYY-MM-DD`);
    if (!str(c.summary)) err(corrFile, `${where}: missing summary`);
  }
}

finish();

function finish() {
  const w = warnings.length;
  if (w) {
    console.log(`\n${w} warning(s):`);
    for (const m of warnings) console.log(`  ⚠ ${m}`);
  }
  if (errors.length) {
    console.error(`\n${errors.length} error(s):`);
    for (const m of errors) console.error(`  ✖ ${m}`);
  }
  console.log(
    `\nChecked ${countries.size} countries, ${institutions.size} institutions, ${sources.size} sources.`,
  );
  if (errors.length || (STRICT && w)) {
    console.error('Data validation FAILED.');
    process.exit(1);
  }
  console.log('Data validation passed.');
  process.exit(0);
}
