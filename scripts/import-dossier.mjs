#!/usr/bin/env node
// Imports a research dossier (research/pending/*.yml) into data/ as PROVISIONAL findings.
//
//   node scripts/import-dossier.mjs <dossier.yml> [--verification <verification.yml>] [--method "text"]
//
// - Sources are merged into data/sources/<cc>.yml by ID (existing IDs are updated).
// - Findings become safeguard results with verification: needs_review. This script never marks
//   anything verified; that requires a human second reviewer (see docs/researcher-guide.md).
// - If a verification file is given, "adjust" verdicts replace the proposed score with the
//   recommended score, and "cannot_verify" verdicts lower confidence to low.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dossierPath = args[0];
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
if (!dossierPath) {
  console.error('Usage: node scripts/import-dossier.mjs <dossier.yml> [--verification <file>] [--method "text"]');
  process.exit(1);
}

const readYaml = (p) => YAML.parse(fs.readFileSync(path.resolve(ROOT, p), 'utf8'), { schema: 'core' });
const writeYaml = (p, header, obj) =>
  fs.writeFileSync(path.resolve(ROOT, p), `${header}\n${YAML.stringify(obj, { lineWidth: 110, defaultStringType: 'PLAIN', defaultKeyType: 'PLAIN' })}`);

const dossier = readYaml(dossierPath);
const cc = dossier.jurisdiction;
const scope = dossier.scope;
const relDossier = path.relative(ROOT, path.resolve(ROOT, dossierPath)).replaceAll('\\', '/');

// ---- verification verdicts ----
const verdicts = new Map();
const vPath = opt('--verification');
if (vPath) {
  const v = readYaml(vPath);
  const block = (v.dossiers ?? []).find((d) => relDossier.endsWith(d.file.replace(/^\.?\//, '')) || d.file.endsWith(path.basename(dossierPath)));
  for (const f of block?.findings ?? []) verdicts.set(f.safeguard, f);
}

// ---- sources ----
const srcFile = `data/sources/${cc.toLowerCase()}.yml`;
const existing = fs.existsSync(path.join(ROOT, srcFile)) ? readYaml(srcFile).sources ?? [] : [];
const byId = new Map(existing.map((s) => [s.id, s]));
for (const s of dossier.sources ?? []) {
  byId.set(s.id, {
    id: s.id,
    title: s.title,
    title_en: s.title_en ?? null,
    issuing_body: s.issuing_body,
    url: s.url,
    document_type: s.document_type,
    country: cc,
    institution: scope === 'institution' ? dossier.institution.id : null,
    publication_date: s.publication_date ?? null,
    official_reference: s.official_reference ?? null,
    accessed: s.accessed,
    language: s.language,
    archived_url: s.archived_url ?? null,
    notes: s.notes ?? null,
  });
}
writeYaml(srcFile, `# Source register — ${cc}. IDs are stable and must never be reused. See docs/data-model.md.`, {
  sources: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
});

// ---- findings ----
const safeguards = {};
const adjusted = [];
for (const f of dossier.findings) {
  const v = verdicts.get(f.safeguard);
  let result = String(f.proposed_score);
  let confidence = f.confidence ?? null;
  if (v?.verdict === 'adjust' && v.recommended_score != null && String(v.recommended_score) !== result) {
    adjusted.push(`${f.safeguard}: ${result} → ${v.recommended_score}`);
    result = String(v.recommended_score);
  }
  if (v?.verdict === 'cannot_verify') confidence = 'low';
  if (result === 'NR') {
    safeguards[f.safeguard] = { result: 'NR' };
    continue;
  }
  const r = { result, verification: 'needs_review' };
  if (confidence) r.confidence = confidence;
  r.source_ids = f.source_ids ?? [];
  if (f.locator) r.locator = f.locator;
  if (f.evidence_summary) r.evidence = f.evidence_summary.trim();
  r.rationale = (f.rationale ?? '').trim();
  if (['0', '?'].includes(result)) r.sources_reviewed = f.sources_reviewed?.length ? f.sources_reviewed : r.source_ids;
  if (f.gaps) r.gaps = f.gaps.trim();
  r.reviewed = dossier.research_date;
  safeguards[f.safeguard] = r;
}

const method =
  opt('--method') ??
  'Researched with AI assistance from official sources, with an independent automated cross-check. All findings await verification by a human second reviewer.';
const researched = Object.values(safeguards).filter((r) => r.result !== 'NR').length;

if (scope === 'national') {
  const file = fs.readdirSync(path.join(ROOT, 'data/countries')).map((f) => `data/countries/${f}`).find((f) => readYaml(f).iso_code === cc);
  const c = readYaml(file);
  const hasInst = (c.institutions_researched ?? []).length > 0;
  Object.assign(c, {
    research_status: researched === 12 ? (hasInst ? 'institution_research_available' : 'national_framework_reviewed') : 'partially_researched',
    last_reviewed: dossier.research_date,
    confidence: c.confidence ?? 'medium',
    national_framework: { summary: dossier.framework_summary.trim() },
    safeguards: { ...c.safeguards, ...safeguards },
    evidence_gaps: dossier.evidence_gaps ?? [],
    researcher_notes: (dossier.unresolved ?? []).length ? `Unresolved questions: ${dossier.unresolved.join(' ')}` : null,
    research_method: method,
    research_dossier: relDossier,
  });
  writeYaml(file, `# ${c.name} — country record. Findings are provisional until verified. See docs/data-model.md.`, c);
  console.log(`Updated ${file}`);
} else {
  const inst = dossier.institution;
  const slug = inst.id.slice(cc.length + 1);
  const file = `data/institutions/${cc.toLowerCase()}/${slug}.yml`;
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  const record = {
    id: inst.id,
    canonical_name: inst.canonical_name,
    local_name: inst.local_name ?? null,
    country: cc,
    website: inst.website,
    institution_type: inst.institution_type,
    research_status: researched === 12 ? 'researched' : 'partially_researched',
    last_reviewed: dossier.research_date,
    methodology_version: '0.1',
    confidence: 'medium',
    evidence_note: dossier.evidence_note?.trim() ?? null,
    correction_status: 'none',
    safeguards,
    evidence_gaps: [...(dossier.evidence_gaps ?? []), ...(dossier.unresolved ?? []).map((u) => `Unresolved: ${u}`)],
    research_method: method,
    research_dossier: relDossier,
  };
  writeYaml(file, `# ${inst.canonical_name} — institution record. Findings are provisional until verified.`, record);
  // Link from the country record and bump its status if its national framework is complete.
  const cfile = fs.readdirSync(path.join(ROOT, 'data/countries')).map((f) => `data/countries/${f}`).find((f) => readYaml(f).iso_code === cc);
  const c = readYaml(cfile);
  c.institutions_researched = [...new Set([...(c.institutions_researched ?? []), inst.id])];
  if (c.research_status === 'national_framework_reviewed') c.research_status = 'institution_research_available';
  writeYaml(cfile, `# ${c.name} — country record. Findings are provisional until verified. See docs/data-model.md.`, c);
  console.log(`Wrote ${file}; linked from ${cfile}`);
}
console.log(`Merged sources into ${srcFile}`);
if (adjusted.length) console.log(`Applied verifier adjustments: ${adjusted.join(', ')}`);
