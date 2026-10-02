// ============================================================================
//  utils — escaping html`` template, ids, small helpers
// ============================================================================

/** Marks a string as already-safe markup. Only created by html`` and raw(). */
class Safe {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"'`]/g, (c) => ESC[c]);

/** Explicitly trusted markup (icons, output of html``). Never pass user text. */
export const raw = (s) => new Safe(String(s));

/**
 * Tagged template that escapes every interpolation unless it is Safe or an
 * array of Safe/strings-from-html``. This is the app's XSS barrier: user text
 * can only reach the DOM through esc() or textContent.
 */
export function html(strings, ...vals) {
  let out = strings[0];
  for (let i = 0; i < vals.length; i++) {
    out += render(vals[i]) + strings[i + 1];
  }
  return new Safe(out);
}
function render(v) {
  if (v instanceof Safe) return v.s;
  if (Array.isArray(v)) return v.map(render).join('');
  if (v === false || v == null) return '';
  return esc(v);
}

export const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID()
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function debounce(fn, ms = 200) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
}

export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || '');

/** Normalise for search: lowercase, strip Arabic diacritics/tatweel, unify alef/yaa/taa-marbuta. */
export function fold(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

export const HEX = /^#[0-9a-f]{6}$/i;
export const safeColor = (c, fallback = '#7C9CCB') => (HEX.test(c || '') ? c : fallback);

/** Readable text colour (black/white) over a swatch. */
export function onColor(hex) {
  const c = safeColor(hex).slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.35 ? '#0F1114' : '#FFFFFF';
}

/** Fractional position between two neighbours (either may be null). */
export function between(a, b) {
  if (a == null && b == null) return 1024;
  if (a == null) return b - 1024;
  if (b == null) return a + 1024;
  return (a + b) / 2;
}

export function download(filename, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function groupBy(arr, fn) {
  const m = new Map();
  for (const x of arr) { const k = fn(x); (m.get(k) || m.set(k, []).get(k)).push(x); }
  return m;
}

export function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const f = [...container.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )].filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!f.length) { e.preventDefault(); return; }
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/** Never log secrets: strip token-looking things from anything we print. */
export function safeLog(...args) {
  const scrub = (v) => (typeof v === 'string'
    ? v.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]')
    : v instanceof Error ? v.message.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[token]') : '[object]');
  console.warn('[proof]', ...args.map(scrub));
}
