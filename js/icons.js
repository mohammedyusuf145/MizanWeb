// One consistent inline SVG set: 24px grid, 1.6 stroke, round caps. No emoji as UI.
import { raw } from './utils.js';

const P = {
  today: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  projects: '<rect x="3.5" y="4" width="7" height="7" rx="1"/><rect x="13.5" y="4" width="7" height="7" rx="1"/><rect x="3.5" y="14" width="7" height="6" rx="1"/><rect x="13.5" y="14" width="7" height="6" rx="1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  chevronR: '<path d="M9 5l7 7-7 7"/>',
  chevronL: '<path d="M15 5l-7 7 7 7"/>',
  chevronD: '<path d="M5 9l7 7 7-7"/>',
  grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4.5 4.5"/>',
  flag: '<path d="M6 21V4.5M6 5h11l-2 4 2 4H6"/>',
  tag: '<path d="M3.5 12.2V4.5h7.7l9 9a1.5 1.5 0 0 1 0 2.1l-5.6 5.6a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="9" r="1.2"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5V19h14V8.5M10 12.5h4"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5"/>',
  undo: '<path d="M9 8H15a4.5 4.5 0 0 1 0 9H8M9 8l3.5-3.5M9 8l3.5 3.5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
  upload: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
  logout: '<path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14M10 8l-4 4 4 4M6 12h9.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  eyeOff: '<path d="M4 4l16 16M9.8 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.2 7.8A15 15 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.2-.6"/>',
  wifiOff: '<path d="M3 3l18 18M8.5 16a5 5 0 0 1 7 0M5 12.5a9.5 9.5 0 0 1 3-2M12 20h.01M19 12.5a9.5 9.5 0 0 0-5.5-2.9"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.500 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  command: '<path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h2.5a2.5 2.5 0 1 1-2.5 2.5V15zm0 0H9m0 0H6.5A2.5 2.5 0 1 0 9 17.5V15z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  snooze: '<path d="M5 8h5l-5 6h5M13 6h6l-6 7h6"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 11a3.8 3.8 0 0 1-.5 7.5z"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1M17.5 3v4h-4M6.5 21v-4h4"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
  google: '<path d="M21 12.2c0-.7-.1-1.300-.2-1.900H12v3.600h5.100a4.400 4.400 0 0 1-1.900 2.900v2.400h3.100c1.800-1.700 2.700-4.100 2.700-7zM12 21.500c2.600 0 4.700-.9 6.300-2.300l-3.100-2.400c-.9.600-2 .9-3.200.9-2.500 0-4.500-1.700-5.300-3.900H3.500v2.500A9.500 9.500 0 0 0 12 21.500zM6.700 13.800a5.700 5.700 0 0 1 0-3.600V7.700H3.500a9.500 9.500 0 0 0 0 8.600zM12 6.400c1.400 0 2.700.5 3.700 1.500l2.800-2.800A9.500 9.500 0 0 0 3.500 7.700l3.200 2.500C7.500 8 9.500 6.400 12 6.400z" fill="currentColor" stroke="none"/>',
};

/** icon('plus') → inline SVG. Directional icons flip in RTL via the .i-flip class. */
export function icon(name, { size = 20, cls = '' } = {}) {
  const body = P[name] || P.info;
  return raw(
    `<svg class="i ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
  );
}
export const flipIcon = (name, o = {}) => icon(name, { ...o, cls: `i-flip ${o.cls || ''}` });
