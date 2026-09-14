// Expand all evidence panels when printing so findings are never hidden on paper.
// Served as an external file so the Content-Security-Policy can use script-src 'self' without hashes.
window.addEventListener('beforeprint', () => document.querySelectorAll('details').forEach((d) => { d.dataset.wasOpen = d.open; d.open = true; }));
window.addEventListener('afterprint', () => document.querySelectorAll('details').forEach((d) => { d.open = d.dataset.wasOpen === 'true'; }));
