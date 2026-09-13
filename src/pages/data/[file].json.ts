import type { APIRoute } from 'astro';
import { getCountries, getInstitutions, getSources, getEvidence, getRubric } from '../../lib/data';

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
  const body = {
    dataset: name,
    licence: 'CC-BY-4.0',
    methodology_version: getRubric().methodology_version,
    note: 'NR, ? and 0 are distinct values. Findings with verification "needs_review" are provisional.',
    data: DATASETS[name](),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json' } });
};
