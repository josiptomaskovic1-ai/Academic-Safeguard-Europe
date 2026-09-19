// Build-time data access. Reads YAML from the repository; never invents values.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();

export type ResultValue = 'NR' | '?' | '0' | '1' | '2' | '3';
export type Verification = 'verified' | 'needs_review' | 'disputed';
export type Confidence = 'high' | 'medium' | 'low';

export interface SafeguardResult {
  result: ResultValue;
  verification?: Verification;
  confidence?: Confidence;
  source_ids?: string[];
  sources_reviewed?: string[];
  locator?: string;
  evidence?: string;
  rationale?: string;
  gaps?: string;
  reviewed?: string;
  dispute_ids?: string[];
  second_reviewer?: string;
  notes?: string;
}

export interface SafeguardDef {
  id: string;
  slug: string;
  name: string;
  question: string;
  notes?: string;
  levels: Record<'0' | '1' | '2' | '3', string>;
}

export interface Rubric {
  methodology_version: string;
  published: string;
  status: string;
  result_values: { value: ResultValue; label: string; meaning: string }[];
  confidence_levels: { value: Confidence; meaning: string }[];
  verification_statuses: { value: Verification; meaning: string }[];
  general_rules: string[];
  safeguards: SafeguardDef[];
  research_statuses: { value: string; label: string }[];
}

export interface Country {
  iso_code: string;
  slug: string;
  name: string;
  local_name: string;
  eu_status: string;
  eu_accession_year: number;
  methodology_version: string;
  research_status: string;
  last_reviewed: string | null;
  confidence: Confidence | null;
  national_framework: { summary: string | null };
  safeguards: Record<string, SafeguardResult>;
  institutions_researched: string[];
  evidence_gaps: string[];
  researcher_notes: string | null;
  research_method?: string;
  research_dossier?: string;
}

export interface Institution {
  id: string;
  canonical_name: string;
  local_name?: string;
  country: string;
  website: string;
  institution_type: string;
  research_status: string;
  last_reviewed: string;
  methodology_version: string;
  confidence?: Confidence | null;
  evidence_note?: string;
  safeguards: Record<string, SafeguardResult>;
  correction_status: 'none' | 'open' | 'resolved';
  evidence_gaps?: string[];
  research_method?: string;
  research_dossier?: string;
  replies?: { received: string; submitted_by: string; text: string }[];
}

export interface Source {
  id: string;
  title: string;
  title_en?: string;
  issuing_body: string;
  url: string;
  document_type: string;
  country: string;
  institution?: string | null;
  publication_date?: string | number | null;
  official_reference?: string | null;
  accessed: string;
  language: string;
  archived_url?: string | null;
  /**
   * False when the cited text is an unofficial consolidation (for example zakon.hr) rather than the
   * official gazette text. Absent means the source is an official text. Surfaced in every citation,
   * because a consolidation can lag or misstate the version in force.
   */
  official_text?: boolean;
  notes?: string | null;
}

export interface EvidenceItem {
  id: string;
  title: string;
  author_body: string;
  year: number | null;
  jurisdiction: string;
  categories: string[];
  source_type: string;
  url: string;
  doi?: string | null;
  summary: string;
  notes?: string | null;
}

export interface Correction {
  id: string;
  received: string;
  type: string;
  target: string;
  submitted_by_role: string;
  summary: string;
  status: string;
  resolution: string | null;
  resolved: string | null;
}

// YAML "core" schema keeps dates as strings, which is what we want for display.
const read = <T>(file: string): T => YAML.parse(fs.readFileSync(file, 'utf8'), { schema: 'core' }) as T;

const ymlIn = (dir: string): string[] => {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((d) => {
    const rel = path.join(dir, d.name);
    return d.isDirectory() ? ymlIn(rel) : /\.ya?ml$/.test(d.name) ? [path.join(ROOT, rel)] : [];
  });
};

let cache: {
  rubric: Rubric;
  countries: Country[];
  institutions: Institution[];
  sources: Map<string, Source>;
  evidence: EvidenceItem[];
  corrections: Correction[];
} | null = null;

function loadAll() {
  if (cache) return cache;
  const rubric = read<Rubric>(path.join(ROOT, 'methodology/scoring-rubric.yml'));
  const countries = ymlIn('data/countries')
    .map((f) => read<Country>(f))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const institutions = ymlIn('data/institutions')
    .map((f) => read<Institution>(f))
    .sort((a, b) => a.canonical_name.localeCompare(b.canonical_name, 'en'));
  const sources = new Map<string, Source>();
  for (const f of ymlIn('data/sources')) for (const s of read<{ sources: Source[] }>(f).sources ?? []) sources.set(s.id, s);
  const libFile = path.join(ROOT, 'evidence-library/items.yml');
  const evidence = fs.existsSync(libFile) ? (read<{ items: EvidenceItem[] }>(libFile).items ?? []) : [];
  const corrFile = path.join(ROOT, 'data/corrections.yml');
  const corrections = fs.existsSync(corrFile) ? (read<{ corrections: Correction[] }>(corrFile).corrections ?? []) : [];
  cache = { rubric, countries, institutions, sources, evidence, corrections };
  return cache;
}

export const getRubric = () => loadAll().rubric;
export const getCountries = () => loadAll().countries;
export const getCountry = (iso: string) => loadAll().countries.find((c) => c.iso_code === iso);
export const getInstitutions = () => loadAll().institutions;
export const getInstitution = (id: string) => loadAll().institutions.find((i) => i.id === id);
export const getInstitutionsFor = (iso: string) => loadAll().institutions.filter((i) => i.country === iso);
export const getSources = () => [...loadAll().sources.values()];
export const getSource = (id: string) => loadAll().sources.get(id);
export const getEvidence = () => loadAll().evidence;
export const getCorrections = () => loadAll().corrections;

export const RESULT_LABELS: Record<ResultValue, string> = {
  NR: 'Not yet researched',
  '?': 'Unable to assess',
  '0': 'Not identified',
  '1': 'Limited',
  '2': 'Substantial',
  '3': 'Strong',
};

export const COUNTRY_STATUS_LABELS: Record<string, string> = {
  not_researched: 'Not yet researched',
  research_underway: 'Research underway',
  partially_researched: 'Partially researched',
  national_framework_reviewed: 'National framework reviewed',
  institution_research_available: 'Institution-level research available',
};

export const INSTITUTION_STATUS_LABELS: Record<string, string> = {
  research_underway: 'Research underway',
  partially_researched: 'Partially researched',
  researched: 'All safeguards researched',
};

export const VERIFICATION_LABELS: Record<Verification, string> = {
  verified: 'Independently verified',
  needs_review: 'Provisional — awaiting verification',
  disputed: 'Disputed',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  legislation: 'Legislation',
  regulation: 'Regulation',
  statute: 'Institutional statute',
  policy: 'Policy',
  code_of_ethics: 'Code of ethics',
  procedure: 'Procedure',
  guidance: 'Guidance',
  report: 'Report',
  standard: 'Standard',
  other: 'Other',
};

/** Summary counts of results for a record; used for honest coverage statements, never for ranking. */
export function coverage(safeguards: Record<string, SafeguardResult>) {
  const values = Object.values(safeguards);
  const researched = values.filter((r) => r.result !== 'NR');
  return {
    total: values.length,
    researched: researched.length,
    verified: researched.filter((r) => r.verification === 'verified').length,
    provisional: researched.filter((r) => r.verification === 'needs_review').length,
    disputed: researched.filter((r) => r.verification === 'disputed').length,
  };
}

export const hasFindings = (s: Record<string, SafeguardResult>) => Object.values(s).some((r) => r.result !== 'NR');

export type Coverage = ReturnType<typeof coverage>;

/** Coverage across a country's national record and all of its institution profiles (for status qualifiers only). */
export function countryCoverageWithInstitutions(iso: string): Coverage {
  const c = getCountry(iso);
  const records = [c?.safeguards ?? {}, ...getInstitutionsFor(iso).map((i) => i.safeguards)];
  return records.map(coverage).reduce(
    (a, b) => ({ total: a.total + b.total, researched: a.researched + b.researched, verified: a.verified + b.verified, provisional: a.provisional + b.provisional, disputed: a.disputed + b.disputed }),
    { total: 0, researched: 0, verified: 0, provisional: 0, disputed: 0 },
  );
}

// Presentation only: BCP 47 language tags for each Member State's local name, in the order the
// names appear in data/countries/*.yml ("België / Belgique / Belgien"). Country codes are not language codes.
const LOCAL_NAME_LANGS: Record<string, string[]> = {
  AT: ['de'], BE: ['nl', 'fr', 'de'], BG: ['bg'], HR: ['hr'], CY: ['el', 'tr'], CZ: ['cs'], DK: ['da'], EE: ['et'],
  FI: ['fi', 'sv'], FR: ['fr'], DE: ['de'], GR: ['el'], HU: ['hu'], IE: ['ga', 'en'], IT: ['it'], LV: ['lv'], LT: ['lt'],
  LU: ['lb', 'fr', 'de'], MT: ['mt'], NL: ['nl'], PL: ['pl'], PT: ['pt'], RO: ['ro'], SK: ['sk'], SI: ['sl'], ES: ['es'], SE: ['sv'],
};

/** Primary language of a Member State, or undefined when there is no single one to declare. */
export const primaryLang = (iso: string): string | undefined => {
  const l = LOCAL_NAME_LANGS[iso];
  return l && l.length === 1 ? l[0] : undefined;
};

/** Splits a local name into language-tagged parts; parts without a known language get no lang attribute. */
export function localNameParts(iso: string, localName: string): { text: string; lang?: string }[] {
  const parts = localName.split(' / ');
  const langs = LOCAL_NAME_LANGS[iso] ?? [];
  return parts.map((text, i) => ({ text, lang: parts.length === langs.length ? langs[i] : undefined }));
}
