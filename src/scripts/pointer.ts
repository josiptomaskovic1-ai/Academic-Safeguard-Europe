/**
 * Pointer effects: the magnetic pull on the two or three biggest calls to action,
 * and the cursor spotlight on navy sections.
 *
 * Both are fine-pointer only and both are off under reduced motion. Neither carries
 * any meaning, so losing them costs nothing: they exist to make the page feel
 * tactile under a mouse.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

const active = () => fine.matches && !reduced.matches;

/* ---- Magnetic pull: at most 6px, and it eases back ---------------------- */

const MAX = 6;

for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
  let raf = 0;

  const move = (event: PointerEvent) => {
    if (!active()) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const dx = (event.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (event.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty('--mx', `${Math.max(-1, Math.min(1, dx)) * MAX}px`);
      el.style.setProperty('--my', `${Math.max(-1, Math.min(1, dy)) * MAX}px`);
      el.style.setProperty('--press', el.dataset.pressed === 'true' ? '0.97' : '1');
    });
  };

  const release = () => {
    cancelAnimationFrame(raf);
    el.style.transitionDuration = '400ms';
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    window.setTimeout(() => el.style.removeProperty('transition-duration'), 420);
  };

  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', release);
  el.addEventListener('blur', release);
}

/* ---- Cursor spotlight on navy sections ---------------------------------- */

const sections = [...document.querySelectorAll<HTMLElement>('section.on-navy')];

if (sections.length) {
  const onscreen = new Set<HTMLElement>();
  let raf = 0;
  let pending: { x: number; y: number } | null = null;

  const paint = () => {
    raf = 0;
    if (!pending) return;
    const { x, y } = pending;
    for (const s of onscreen) {
      const r = s.getBoundingClientRect();
      s.style.setProperty('--sx', `${((x - r.left) / r.width) * 100}%`);
      s.style.setProperty('--sy', `${((y - r.top) / r.height) * 100}%`);
    }
  };

  const onMove = (event: PointerEvent) => {
    if (!active()) return;
    pending = { x: event.clientX, y: event.clientY };
    if (!raf) raf = requestAnimationFrame(paint);
  };

  const clear = () => {
    for (const s of sections) delete s.dataset.spot;
  };

  // Only sections actually on screen get updated, and only while motion is welcome.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting && active()) {
          onscreen.add(el);
          el.dataset.spot = '';
        } else {
          onscreen.delete(el);
          delete el.dataset.spot;
        }
      }
    });
    sections.forEach((s) => io.observe(s));
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  reduced.addEventListener('change', () => {
    if (reduced.matches) clear();
  });
  fine.addEventListener('change', () => {
    if (!fine.matches) clear();
  });
}
