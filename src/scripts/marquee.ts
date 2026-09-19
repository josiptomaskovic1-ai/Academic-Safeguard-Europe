/**
 * Marquee control.
 *
 * The band scrolls in CSS. This file only decides when it should be paused, and
 * owns the WCAG 2.2.2 pause control. With no JavaScript the band still scrolls and
 * still stops on hover and focus, because those are CSS rules; the button is the
 * part that needs script, so it is only wired up when script is available.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const band = document.querySelector<HTMLElement>('[data-mq]');
const toggle = band?.querySelector<HTMLButtonElement>('[data-mq-toggle]');
const label = toggle?.querySelector<HTMLElement>('.mq-label');

if (band && toggle && label) {
  // Paused by the person, versus paused because the band cannot be seen. Both stop
  // the animation, but only the first survives scrolling back into view.
  let userPaused = false;
  let visible = true;

  const render = () => {
    const off = userPaused || !visible || document.hidden || reduced.matches;
    band.dataset.mqState = off ? 'paused' : 'running';
    toggle.setAttribute('aria-pressed', String(userPaused));
    label.textContent = userPaused ? 'Play' : 'Pause';
  };

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    render();
  });

  // Out of sight: no reason to spend a compositor frame on it.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible = e.isIntersecting;
        render();
      },
      { threshold: 0 },
    );
    io.observe(band);
  }

  document.addEventListener('visibilitychange', render);
  reduced.addEventListener('change', render);

  render();
}
