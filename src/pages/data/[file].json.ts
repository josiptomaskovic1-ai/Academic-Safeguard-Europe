import type { APIRoute } from 'astro';
import { getCountries, getInstitutions, getSources, getEvidence, getRubric } from '../../lib/data';
import { REPO_URL } from '../../lib/url';

const DATASETS = {
  countries: () => getCountries(),
  institutions: () => getInstitutions(),
  sources: () => getSources(),
  'evidence-library': () => getEvidence(),
  rubric: () => getRubric(),
} as const;

export function getStaticPaths() {
  return Object.keys(DATASETS).map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) => {
  const name = params.file as keyof typeof DATASETS;
  // Envelope caveats travel with every export so scraped data keeps its context. Counts are over researched (non-NR) results.
  const results = [...getCountries(), ...getInstitutions()].flatMap((r) => Object.values(r.safeguards)).filter((r) => r.result !== 'NR');
  const body = {
    dataset: name,
    licence: 'CC-BY-4.0',
    methodology_version: getRubric().methodology_version,
    generated_at: new Date().toISOString().slice(0, 10),
    note: 'NR, ? and 0 are distinct values. Findings with verification "needs_review" are provisional.',
    verification_summary: {
      verified: results.filter((r) => r.verification === 'verified').length,
      needs_review: results.filter((r) => r.verification === 'needs_review').length,
      disputed: results.filter((r) => r.verification === 'disputed').length,
    },
    caveats: [
      "All findings with verification 'needs_review' are provisional and have not been verified by a human reviewer.",
      "Findings may have been prepared with AI assistance; see each record's research_method.",
      '0 means no qualifying provision was identified in the sources reviewed; it is not proof that no safeguard exists.',
      'Do not aggregate results into overall scores or rankings.',
      'ASE evaluates published rules, not individuals or implementation.',
    ],
    docs: {
      methodology: `${REPO_URL}/blob/main/methodology/methodology-v0.1.md`,
      data_model: `${REPO_URL}/blob/main/docs/data-model.md`,
    },
    data: DATASETS[name](),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
