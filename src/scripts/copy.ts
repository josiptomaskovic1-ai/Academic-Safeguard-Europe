/**
 * Copy the share text.
 *
 * Progressive enhancement: the text itself is on the page and selectable, so this
 * only saves a step. If the clipboard is unavailable or refuses (permissions,
 * insecure context), the text is selected instead, which leaves the reader one
 * keystroke away rather than stranded.
 *
 * No markup is ever built from a string: the check mark is in the HTML already and
 * the status is written with textContent.
 */
const button = document.querySelector<HTMLButtonElement>('[data-copy]');
const status = document.querySelector<HTMLElement>('[data-copy-status]');
const source = document.querySelector<HTMLElement>('.share-text');

if (button && status && source) {
  let timer = 0;

  const settle = (message: string) => {
    status.textContent = message;
    button.dataset.copied = 'true';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      status.textContent = '';
      delete button.dataset.copied;
    }, 2000);
  };

  const selectInstead = () => {
    const range = document.createRange();
    range.selectNodeContents(source);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    settle('Selected');
  };

  button.addEventListener('click', async () => {
    const text = source.textContent?.trim() ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      settle('Copied');
    } catch {
      selectInstead();
    }
  });
}
