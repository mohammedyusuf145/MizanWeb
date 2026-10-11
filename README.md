# Mizan · ميزان

A personal study operating system: a task board, a focus timer and an AI tutor that share one set of data.
Bilingual (Arabic RTL / English), offline-first, installable as a PWA.

> **Status:** Phase 4 of 6 — focus timer, Focus Garden and stats, on top of the calendar and reminders (Phase 3),
> the board (Phase 2) and the foundation (Phase 1).

## Using the board

| | |
| --- | --- |
| **N** | Quick-add a card. Type naturally: `Math homework tomorrow 5pm`, `اختبار الكيمياء الخميس عاجل 45 دقيقة`. Understands dates (today, tomorrow/بكرة/باچر, weekdays, `in 3 days`, `15/10`), times (`5pm`, `الساعة 5`, `7 مساءً`), `@subject`, `#label`, `!high`/`عاجل`, and estimates (`45m`, `ساعة`). |
| **/** | Search cards (title, description, notes, labels; ignores Arabic diacritics and hamza forms) |
| **⌘/Ctrl K** | Command palette, including search across all cards |
| **?** | All keyboard shortcuts |
| Drag | Mouse: drag. Touch: long-press then drag. Keyboard: focus a card, **Space**, arrow keys, **Space**. |

Cards open in a side panel (bottom sheet on phones) with status, subject, due date and time, priority, exam flag,
focus estimate, repeat rule, labels, checklist, Markdown description, attachments and notes. Everything saves as you type.
Moving a card into a "done" column completes it; completing a repeating card creates the next one.
Group the board by status, subject, priority or due date, and filter by subject, priority, due date, labels or exams.

Attachments (PDF, images, Word, PowerPoint, Excel, text; up to 20 MB) are stored on the device first and uploaded to the
private `attachments` bucket when online, so they work offline and in demo mode.

## Quick start (no setup — local demo mode)

```bash
npm install
npm run dev          # http://localhost:5173
```

With no Supabase keys, Mizan runs **entirely in your browser** (IndexedDB). Everything works except accounts and
cross-device sync. Your data stays on that device.

## Connect Supabase (accounts + sync)

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Copy `.env.example` → `.env.local` and fill in **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
3. Apply the database migrations — either:
   - **CLI:** `npx supabase login && npx supabase link --project-ref <ref> && npx supabase db push`
   - **Dashboard:** paste each file in `supabase/migrations/` (in order) into **SQL Editor → Run**.
4. **Auth → URL Configuration:** set *Site URL* to your app URL and add `http://localhost:5173` to *Redirect URLs*.
5. **Google sign-in (optional):** Auth → Providers → Google. Create an OAuth client in Google Cloud Console with redirect
   URI `https://<ref>.supabase.co/auth/v1/callback`, then paste the client ID/secret into Supabase.
6. Deploy the Edge Function used by *Delete account*:
   ```bash
   npx supabase functions deploy delete-account
   npx supabase secrets set ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
   ```

The anon key is safe in the browser: every table has Row Level Security, so a user can only read and write their own rows.
**Never** put the service-role key or `ANTHROPIC_API_KEY` in a `VITE_` variable.

## Calendar and reminders

The calendar is drawn from card due dates — there is nothing to enter twice. Day, Week, Month and Agenda views
(Agenda is the default on phones). Drag an event to reschedule its card (keyboard: focus it, **Space**, arrows move
15 minutes / one day, **Space**). Click an empty slot to create a card at that time. Shortcuts: **T** today,
**D/W/M/A** views, **← →** previous/next. Dates respect the week start and Gregorian/Hijri settings.

Reminders default to 1 day and 1 hour before (Settings → Notifications), and each card can use the defaults, its own
times, or none. Date-only cards remind at 08:00 local. Reminders appear in-app (toast + bell) while Mizan is open on
any setup. To receive them when the app is closed (web push):

1. `npx web-push generate-vapid-keys`
2. Put the public key in `VITE_VAPID_PUBLIC_KEY` (Vercel env) and set the function secrets:
   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com CRON_SECRET=$(openssl rand -hex 32)
   npx supabase functions deploy send-reminders --no-verify-jwt
   ```
3. Edit and run `supabase/cron/schedule-reminders.sql` in the SQL editor (project ref + the same `CRON_SECRET`).
   It calls the function every minute; reminders are deduplicated in `reminder_log`.
4. Each device turns on **Settings → Notifications → Device notifications**. On iPhone/iPad, add Mizan to the
   Home Screen first (iOS 16.4+), then enable it from the installed app.

## Focus timer and stats

- **Intervals** (25/5, 50/10 or custom lengths, sessions before a long break, auto-start options) or an **open**
  count-up session. Link a session to a subject and/or a card — from the Focus page or a card's **Focus** button.
  Lengths can be saved per subject.
- **Accurate by construction:** the timer stores timestamps, never counts ticks, so it survives sleeping tabs,
  refreshes and switching devices (the state syncs like any other row). Finished sessions are logged once, even if
  two devices are open, using a deterministic session id.
- **Views:** Focus Garden (a plant that grows through the session, flowers when it's done, rests on breaks and leans
  a little if you leave mid-session), a large clock, a ring, or an ambient wash in the subject colour.
  **F** opens fullscreen focus mode, **Space** starts/pauses.
- **Sound:** rain, café, white and deep noise are synthesised in the browser (no files, works offline); "Your track"
  loops an audio file from your device. Soft two-note chime at the end of a session.
- **Daily goal, streaks** (days with 10+ minutes of focus) and quiet milestone notes.
- **Stats:** focus per day by subject (with a table view), by-subject breakdown, best hours of the day, streaks and
  a weekly summary. Subject colours come from a 10-slot palette validated for both themes (lightness band, chroma,
  colour-blind separation of neighbours, contrast); charts stack subjects in that fixed order.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript only |
| `npx deno test --allow-env supabase/functions/send-reminders` | Edge Function tests (Deno) |

## How it fits together

```
UI (React) ──reads──▶ IndexedDB (Dexie, live queries)      ← every screen reads local data: instant + offline
     │                    ▲
     └──writes──▶ repo.ts ─┴─▶ outbox ──flush──▶ Supabase Postgres (RLS, last-write-wins trigger)
                                                   │
                       other devices ◀── Realtime ─┘   + incremental pull on reconnect
```

- **Last-write-wins:** each row carries `updated_at` (time of the user's edit). The Postgres trigger rejects a write older
  than the stored row, and the client applies the same rule when merging incoming rows.
- **Deletes are soft** (`deleted_at`), so deletions sync like any other change.
- **`server_updated_at`** (server clock) is used only as the pull cursor, so a device with a wrong clock never misses changes.
- **Claude API** is only ever called from a Supabase Edge Function (Phase 5). The key never reaches the browser.

## Folder structure

```
src/
  app/            router, route guards, shell (Sidebar, BottomTabs, CommandPalette, PageHeader)
  design/         tokens.css (single source of truth) + tokens.ts (motion, subject palette)
  components/ui/  Button, IconButton, Field/Input/Select/Textarea, Dialog, Sheet, Tabs,
                  Checkbox/Switch, Segmented, Menu/Popover, Badge, Kbd, Skeleton,
                  ProgressRing/Bar, EmptyState/ErrorState, Toast
  features/       cards, subjects, settings, onboarding (calendar, timer, tutor… in later phases)
  lib/            db/ (Dexie schema, repo, sync engine, LWW merge), auth, i18n, dates, theme, supabase
  locales/        en.ts, ar.ts (typed: a missing Arabic key is a compile error)
  routes/         one lazily-loaded module per page
supabase/
  migrations/     core schema, RLS, storage bucket, realtime publication, reminders + push
  functions/      _shared (CORS, JWT check), delete-account, send-reminders (web push)
  cron/           one-off SQL to schedule send-reminders with pg_cron
```

## Design system

Open **`/design`** in the app (or *Design system* in the ⌘K / Ctrl+K palette) to see every token and component.
Switch language and theme from the palette to check RTL and light mode.

- Surfaces `#0B0C0F → #1F232A`, text `#ECEDEF / #A4A9B2 / #858B95`, accent **Verdigris `#5CC8A8`** — all pairs checked for WCAG AA.
- Geist + IBM Plex Sans Arabic, Geist Mono for numbers. 8px grid. Radius by role (4 / 6 / 10 / 14).
- Motion 120–300ms with `cubic-bezier(0.2, 0, 0, 1)`; collapses to short fades under `prefers-reduced-motion`.
