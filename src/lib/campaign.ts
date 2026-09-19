// Campaign copy shared by Home, The Problem and Our Demands, so the three pages never drift apart.
// This is advocacy text, not research data: it makes no prevalence claims and changes no finding.
// Safeguard names and anchors always come from methodology/scoring-rubric.yml.
import { getRubric } from './data';

export const CAMPAIGN_NAME = 'Safe to Speak';

/**
 * The association that publishes this project, per its signed Statute (Articles 2 and 3):
 * the legal name is "StudentSafe Europa", the English name "StudentSafe Europe" and the short
 * name "StudentSafe". Article 2 says the association primarily uses the English name in its
 * international, programme, research and communication work, which is what this site is.
 * Academic Safeguard Europe is a programme of that association, not a separate body.
 */
export const ORG_NAME = 'StudentSafe Europe';
export const ORG_NAME_LEGAL = 'StudentSafe Europa';
export const ORG_SHORT = 'StudentSafe';
export const ORG_SEAT = 'Zagreb, Croatia';

/** The key sentence, split so the homepage can accent its closing phrase. Advocacy, not a finding. */
export const KEY_SENTENCE_LEAD = 'A complaint mechanism is not protection if using it can cost you your ';
export const KEY_SENTENCE_ACCENT = 'academic future.';
export const KEY_SENTENCE = `${KEY_SENTENCE_LEAD}${KEY_SENTENCE_ACCENT}`;

/** The campaign triad. The last line carries the ink bar on the homepage. */
export const TRIAD = ['Safe to speak.', 'Safe to appeal.', 'Safe from retaliation.'] as const;

/** The dependencies a student can have on one academic hierarchy. Structural, not a claim about any person. */
export const POWERS = [
  { term: 'Assessment', detail: 'Grades, examinations and the thesis defence.' },
  { term: 'Supervision', detail: 'Research direction, access to labs, data and time.' },
  { term: 'Recommendation', detail: 'References for jobs, grants and further study.' },
  { term: 'Degree progression', detail: 'Permission to continue, submit or graduate.' },
  { term: 'Funding', detail: 'Scholarships, contracts and assistantships.' },
  { term: 'Future opportunities', detail: 'Networks, co-authorship and a career in the field.' },
];

const bySafeguard = (ids: string[]) => {
  const all = getRubric().safeguards;
  return ids.map((id) => {
    const s = all.find((x) => x.id === id);
    if (!s) throw new Error(`campaign.ts references unknown safeguard ${id}`);
    return { id: s.id, slug: s.slug, name: s.name };
  });
};

/** Four plain-language principles, each mapped to the Standard's safeguards it summarises. */
export const PRINCIPLES = [
  { icon: 'S02', title: 'Protection from retaliation', text: 'Raising a concern must never cost a student a grade, a supervisor, a reference or a place.', safeguards: bySafeguard(['S02', 'S05']) },
  { icon: 'S03', title: 'Independent complaint procedures', text: 'Complaints are heard by a body independent of the people involved, within set deadlines and with written reasons.', safeguards: bySafeguard(['S03', 'S06', 'S07']) },
  { icon: 'S04', title: 'Conflict-of-interest safeguards', text: 'Anyone with a personal stake in a complaint must step aside from deciding it.', safeguards: bySafeguard(['S04']) },
  { icon: 'S08', title: 'Effective appeal and remedy', text: 'Outcomes can be challenged before another body, and academic harm can be put right.', safeguards: bySafeguard(['S08', 'S10']) },
];

/** ASE's three campaign demands. Policy positions, distinct from the research Standard. */
export const DEMANDS = [
  {
    id: 'minimum-safeguards',
    title: 'European minimum safeguards',
    summary: 'Europe should establish clear minimum safeguards against abuse of academic power, so that a student’s protection does not depend on where they happen to study.',
  },
  {
    id: 'quality',
    title: 'Safeguarding as part of higher-education quality',
    summary: 'Protection from abuse of power should become an explicit part of how higher-education quality and institutional accountability are assessed.',
  },
  {
    id: 'monitoring',
    title: 'Public monitoring and accountability',
    summary: 'Students should not have to search through dozens of statutes and regulations to find out whether basic protections exist.',
  },
];
