// Expand all evidence panels when printing so findings are never hidden on paper.
// Served as an external file so the Content-Security-Policy can use script-src 'self' without hashes.
window.addEventListener('beforeprint', () => {
  const panels = [...document.querySelectorAll('details')];
  document.documentElement.dataset.printing = 'true';
  panels.forEach((panel) => {
    panel.dataset.wasOpen = String(panel.open);
    if (panel.hasAttribute('name')) {
      panel.dataset.printName = panel.getAttribute('name');
      panel.removeAttribute('name');
    }
  });
  panels.forEach((panel) => { panel.open = true; });
});

window.addEventListener('afterprint', () => {
  const panels = [...document.querySelectorAll('details')];
  panels.forEach((panel) => { panel.open = panel.dataset.wasOpen === 'true'; });
  panels.forEach((panel) => {
    if (panel.dataset.printName) panel.setAttribute('name', panel.dataset.printName);
    delete panel.dataset.wasOpen;
    delete panel.dataset.printName;
  });
  delete document.documentElement.dataset.printing;
});
