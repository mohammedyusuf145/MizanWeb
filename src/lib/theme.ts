import type { ThemePref } from '@/types/database';

const KEY = 'mizan.theme';
let mql: MediaQueryList | null = null;
let listener: (() => void) | null = null;

/** Apply the theme to <html data-theme>. Cached so index.html can set it before first paint. */
export function applyTheme(pref: ThemePref) {
  const resolve = () => {
    const dark = pref === 'dark' || (pref === 'system' && !window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0B0C0F' : '#F6F5F2');
  };
  if (mql && listener) mql.removeEventListener('change', listener);
  mql = null;
  listener = null;
  if (pref === 'system') {
    mql = window.matchMedia('(prefers-color-scheme: light)');
    listener = resolve;
    mql.addEventListener('change', listener);
  }
  resolve();
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* ignore */
  }
}
