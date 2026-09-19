/**
 * Homepage hero — the only part of the opening sequence that needs JavaScript.
 *
 * The headline, highlighter, lede and buttons animate in pure CSS with `backwards`
 * fill, so they play with no script at all. Only the typing dots are gated here,
 * because the finished mark must contain no dots when nothing is animating: with
 * JS off, in print and under reduced motion the mark simply reads "Safe to Speak".
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const hero = document.querySelector<HTMLElement>('.m-hero');

const play = () => {
  if (!hero || reduced.matches) return;
  hero.dataset.intro = 'run';
};

const stop = () => {
  if (hero) delete hero.dataset.intro;
};

play();

// A viewer who turns motion off mid-session gets the final state immediately.
reduced.addEventListener('change', () => (reduced.matches ? stop() : undefined));
