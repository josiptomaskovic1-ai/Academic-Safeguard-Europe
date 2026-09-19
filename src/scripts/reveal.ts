/**
 * Section reveals and the evidence counter.
 *
 * Follows the pattern established in ProtectiveField.astro: IntersectionObserver,
 * run once, unobserve, plus a failsafe timer so nothing can be left waiting. The
 * CSS keyed to [data-reveal='in'] only ever animates FROM an offset state TO the
 * natural one, so with no JavaScript every section is simply already finished.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];

/** Count an aria-hidden copy up to the number already present in the static HTML. */
const runCounter = (el: HTMLElement) => {
  const final = Number(el.dataset.count);
  if (!Number.isFinite(final) || final <= 0) return;
  if (reduced.matches) {
    el.textContent = String(final);
    return;
  }
  const duration = 900;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    // Same settle as --ease-out-expo, so the number lands with the section.
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = String(Math.round(final * eased));
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = String(final);
  };
  requestAnimationFrame(step);
};

const show = (el: HTMLElement) => {
  if (el.dataset.reveal === 'in') return;
  el.dataset.reveal = 'in';
  el.querySelectorAll<HTMLElement>('[data-count]').forEach(runCounter);
};

if (targets.length) {
  if (reduced.matches || !('IntersectionObserver' in window)) {
    // Final state immediately: no movement, but the counter still shows its number.
    targets.forEach(show);
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          show(e.target as HTMLElement);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((el) => io.observe(el));

    // Failsafe: nothing may stay in its offset state because an observer never fired.
    window.setTimeout(() => targets.forEach(show), 1200);
  }

  // Turning motion off mid-session settles everything at once.
  reduced.addEventListener('change', () => {
    if (reduced.matches) targets.forEach(show);
  });
}
