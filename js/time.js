// ============================================================================
//  time — everything is stored as UTC instants; this module is the ONLY place
//  that converts to/from the user's timezone. Day keys are 'YYYY-MM-DD' strings
//  in the user's timezone.
// ============================================================================

let TZ = 'Asia/Bahrain';
let LANG = 'ar';
let WEEK_START = 0;
let clockOffset = 0; // server time - local time, ms (learned from response Date headers)

export const setTimezone = (tz) => { try { new Intl.DateTimeFormat('en', { timeZone: tz }); TZ = tz; } catch { TZ = 'Asia/Bahrain'; } };
export const getTimezone = () => TZ;
export const setLocale = (l) => { LANG = l; };
export const setWeekStart = (w) => { WEEK_START = w; };
export const getWeekStart = () => WEEK_START;
export const setClockOffset = (ms) => { if (Math.abs(ms) < 6 * 3600e3) clockOffset = ms; };
export const nowMs = () => Date.now() + clockOffset;
export const nowIso = () => new Date(nowMs()).toISOString();

const fmtCache = new Map();
function dtf(opts, key) {
  const k = `${LANG}|${TZ}|${key}`;
  if (!fmtCache.has(k)) fmtCache.set(k, new Intl.DateTimeFormat(LANG === 'ar' ? 'ar-u-nu-latn-ca-gregory' : 'en-GB', { timeZone: TZ, ...opts }));
  return fmtCache.get(k);
}
export const clearFormatCache = () => fmtCache.clear();

const partsFmt = new Map();
function partsDtf(tz) {
  if (!partsFmt.has(tz)) {
    partsFmt.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
    }));
  }
  return partsFmt.get(tz);
}

/** UTC instant → {y,m,d,h,mi,dow} in the user's timezone (m is 1-12, dow 0=Sun). */
export function parts(date) {
  const d = date instanceof Date ? date : new Date(date);
  const o = {};
  for (const p of partsDtf(TZ).formatToParts(d)) o[p.type] = p.value;
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, dow };
}

/** Wall-clock time in the user's timezone → UTC Date. */
export function zoned(y, m, d, h = 0, mi = 0) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let t = guess;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(t));
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi);
    const diff = asUtc - guess;
    if (diff === 0) break;
    t -= diff;
  }
  return new Date(t);
}

const pad = (n) => String(n).padStart(2, '0');
export const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
export function dayKey(date) { if (!date) return null; const p = parts(date); return key(p.y, p.m, p.d); }
export const todayKey = () => dayKey(new Date(nowMs()));
export function fromKey(k, h = 0, mi = 0) { const [y, m, d] = k.split('-').map(Number); return zoned(y, m, d, h, mi); }
export function addDaysKey(k, n) {
  const [y, m, d] = k.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return key(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
export function diffDaysKey(a, b) { // b - a
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
}
export function dowKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
export function startOfWeekKey(k) { const diff = (dowKey(k) - WEEK_START + 7) % 7; return addDaysKey(k, -diff); }
export function monthStartKey(k) { return k.slice(0, 7) + '-01'; }
export function addMonthsKey(k, n) {
  const [y, m] = k.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return key(t.getUTCFullYear(), t.getUTCMonth() + 1, 1);
}
export function daysInMonthKey(k) { const [y, m] = k.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

/** Move an instant to another calendar day, keeping the local time of day. */
export function moveToDay(iso, targetKey) {
  const p = parts(iso || new Date(nowMs()));
  return fromKey(targetKey, iso ? p.h : 18, iso ? p.mi : 0);
}
export const timeOfDay = (iso) => { const p = parts(iso); return { h: p.h, mi: p.mi }; };
export function setTime(iso, h, mi) { const p = parts(iso); return zoned(p.y, p.m, p.d, h, mi); }

// ---- formatting ------------------------------------------------------------
export const fmtTime = (d) => dtf({ hour: 'numeric', minute: '2-digit' }, 't').format(new Date(d));
export const fmtDate = (d) => dtf({ day: 'numeric', month: 'short' }, 'd').format(new Date(d));
export const fmtDateLong = (d) => dtf({ weekday: 'long', day: 'numeric', month: 'long' }, 'dl').format(new Date(d));
export const fmtDateYear = (d) => dtf({ day: 'numeric', month: 'short', year: 'numeric' }, 'dy').format(new Date(d));
export const fmtDateTime = (d) => `${fmtDate(d)} · ${fmtTime(d)}`;
export const fmtWeekday = (d) => dtf({ weekday: 'short' }, 'w').format(new Date(d));
export const fmtWeekdayLong = (d) => dtf({ weekday: 'long' }, 'wl').format(new Date(d));
export const fmtMonthYear = (k) => dtf({ month: 'long', year: 'numeric' }, 'my').format(fromKey(k, 12));
export const fmtMonth = (k) => dtf({ month: 'short' }, 'm').format(fromKey(k, 12));
export const fmtDayNum = (k) => String(+k.slice(8, 10));
export const fmtWeekdayKey = (k, long) => dtf({ weekday: long ? 'long' : 'short' }, long ? 'wl' : 'w').format(fromKey(k, 12));
export const fmtDateKey = (k) => dtf({ weekday: 'long', day: 'numeric', month: 'long' }, 'dl').format(fromKey(k, 12));

/** value for <input type="datetime-local"> and <input type="date"> */
export function toInputDateTime(iso) {
  if (!iso) return '';
  const p = parts(iso);
  return `${key(p.y, p.m, p.d)}T${pad(p.h)}:${pad(p.mi)}`;
}
export const toInputDate = (iso) => (iso ? dayKey(iso) : '');
export function fromInputDateTime(v) {
  if (!v) return null;
  const [dk, tm = '00:00'] = v.split('T');
  const [h, mi] = tm.split(':').map(Number);
  const [y, m, d] = dk.split('-').map(Number);
  if (!y || !m || !d) return null;
  return zoned(y, m, d, h || 0, mi || 0).toISOString();
}
export function fromInputDate(v, h = 18, mi = 0) {
  if (!v) return null;
  const [y, m, d] = v.split('-').map(Number);
  if (!y || !m || !d) return null;
  return zoned(y, m, d, h, mi).toISOString();
}

/** All IANA zones for the settings select (falls back to a short list). */
export function allTimezones() {
  try { return Intl.supportedValuesOf('timeZone'); } catch {
    return ['Asia/Bahrain', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Qatar', 'Africa/Cairo',
      'Asia/Amman', 'Asia/Beirut', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'UTC'];
  }
}
export const browserTimezone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'Asia/Bahrain'; } };

// ---- deadline health -------------------------------------------------------
/** 'done' | 'none' | 'over' | 'soon' (within 3 days) | 'ok' */
export function health(dueIso, completed) {
  if (completed) return 'done';
  if (!dueIso) return 'none';
  const ms = new Date(dueIso).getTime() - nowMs();
  if (ms < 0) return 'over';
  if (ms <= 3 * 864e5) return 'soon';
  return 'ok';
}

/** Whole days between now and an instant, by calendar day in the user's timezone. */
export function daysUntil(iso) { return diffDaysKey(todayKey(), dayKey(iso)); }
