# Proof — design plan

Proof (بروف) is a project manager for graphic designers. The name comes from the
*proof sheet*: the contact sheet a photographer prints to judge a whole roll at once.
That is the job of this app: one sheet where every project, task and deadline is
visible together.

## 1. Tokens

### Colour

The chrome is greyscale with a slight cool cast, like a graded film still.
Project colours and covers are the only saturated colour on screen.

| Token     | Dark      | Light     | Role                                                  |
|-----------|-----------|-----------|-------------------------------------------------------|
| `--ink`   | `#0F1114` | `#F3F1EC` | Page. A cool darkroom black, or proof paper in light. |
| `--plate` | `#181B20` | `#FFFFFF` | Raised surfaces: drawers, the palette, menus.         |
| `--rule`  | `#2B3038` | `#D9D5CC` | Hairlines, frame borders, sprocket marks.             |
| `--paper` | `#ECE9E2` | `#16181C` | Text. Warm off-white, like a print under a loupe.     |
| `--grade` | `#9DB8E0` | `#2F5A96` | Focus, selection, primary action. Steel blue from a cool grade. |
| `--late`  | `#F08A7A` | `#B23A2A` | Overdue only. Never used for decoration.              |

Deadline health is a **state**, not decoration. Each state has its own glyph, so
colour is never the only signal:

- On track: hollow ring ○, text in `--paper`
- Within 3 days: half-filled ring ◐, amber `#E7B65C` (light `#8A5A00`)
- Overdue: filled disc ●, `--late`

### Type

- **Alexandria** (Arabic + Latin) is the display face, used for view titles, project
  names on tiles and the date numerals on the reel. It is geometric and wide, close to
  a film title card, and covers both scripts in one design.
- **IBM Plex Sans Arabic** is the UI and body face. It has an engineered, official
  voice and tabular figures, and its Latin glyphs are Plex Sans. It is not Inter.
- Scale (1.2 ratio): 12 · 14 · 16 · 19 · 23 · 28 · 40.
- Line height: 1.5 for Latin and **1.75 for Arabic**, set through `:lang(ar)`. Display
  sizes use 1.15 (Latin) and 1.4 (Arabic).
- Measure: prose is capped at 68ch.
- Figures: Western digits in both languages (`ar-u-nu-latn`). Designers in the Gulf
  read dates and sizes this way in every tool they use.

### Layout

Desktop has a 232px side rail and the content beside it. Phones have a bottom bar with
five 56px targets. All spacing is a 4px grid. Alignment rules:

- Everything aligns to the inline-start edge of the content column. Nothing is centred
  except empty states.
- Numbers (dates, counts) are tabular and aligned to the inline-end edge.
- Radius varies by role: photo frames 2px, task rows 0 (hairline separators), event
  bars 3px, floating panels 10px. There is no universal card.

Today view, desktop:

```
┌──────────┬─────────────────────────────────────────────────────────────┐
│ Proof    │ Today · Thu 2 Oct                         [Quick add  Q]     │
│          │ ┌Overdue┐┌ 02 ┐┌ 03 ┐┌ 04 ┐┌ 05 ┐┌ 06 ┐ ... ┌ 15 ┐  ← reel  │
│ Today    │ │ ■ ■   ││▌now││    ││ ■  ││    ││ ■■ │     │    │   (film  │
│ Projects │ └───────┘└────┘└────┘└────┘└────┘└────┘     └────┘   strip) │
│ Calendar │ ─────────────────────────────────────────────────────────── │
│ Reminders│ Overdue (2)                  │ Reminders                     │
│          │  ● Logo sketches   Nadia  -2d│  Fired · Send proofs 09:00    │
│          │ Due today (3)                │  Missed · Client call         │
│ Settings │  ◐ Poster v2       Expo  17:00│                              │
│ ● Synced │ Next 7 days                  │                               │
└──────────┴─────────────────────────────────────────────────────────────┘
```

Today view, phone (360px):

```
┌──────────────────────────┐
│ Today          Thu 2 Oct │
│ [Ovd][02][03][04][05]→   │  reel scrolls sideways, snaps by frame
│ Overdue (2)              │
│ ● Logo sketches     -2d  │
│ Due today                │
│ ◐ Poster v2       17:00  │
│ Fired reminders          │
├──────────────────────────┤
│ ◎   ▦   ▤   ⏰   ⚙        │  bottom bar, 56px
└──────────────────────────┘
```

Board, desktop:

```
┌──────────┬─────────────────────────────────────────────────────────────┐
│ rail     │ ▓▓▓▓▓▓▓▓▓▓ cover strip (120px, the project's own image) ▓▓▓  │
│          │ Expo poster · Nadia · Poster          ◐ Due Sun 5 Oct  [Edit] │
│          │ 01 Brief   02 Research  03 Concept  04 Design  05 Rev  06 Del │
│          │ ───────    ───────────  ──────────  ─────────                 │
│          │ ☐ Read brief ☐ Moodboard ☐ 3 routes  ☐ Layout                │
│          │ ☐ Call       + Add task                                       │
└──────────┴─────────────────────────────────────────────────────────────┘
                                      task drawer slides in from inline-end ▸
```

Board, phone: one stage column at a time. Stage tabs (01–06) scroll sideways and the
columns snap. Long-press a task row to drag it, either within a column or onto a stage
tab to move it.

## 2. Principles specific to design work

1. **The work is the colour.** Covers and project colours are the only hue. Chrome
   never competes with a client's palette.
2. **Contact sheet, not dashboard.** Projects are frames: image first, caption
   underneath, with metadata set like frame notes.
3. **The deadline is the timecode.** The Today reel lays the next 14 days out as film
   frames. Each project sits on its deadline frame as its own swatch, and a playhead
   marks now.
4. **Stages are a real sequence,** so they are numbered 01–06. Nothing else is.

## 3. Review against the brief

| First draft | Problem | Revision |
|---|---|---|
| A Today header with four stat cards (overdue, today, week, done) | This is every SaaS dashboard. | Replaced with the deadline reel, which is the one bold element. Counts became plain section headings. |
| Amber `#F5A524` as the single accent | A near-black page with one hot accent is the tell the brief warned about. | The accent is now a pale steel blue `--grade` used only for focus and primary actions. Amber is limited to the "within 3 days" state. |
| All surfaces were 12px-radius cards with a soft shadow | This is the identical-card kit. | Radius now varies by role (2 / 0 / 3 / 10px). Task rows are ruled lines, and only floating layers get a shadow. |
| Glass blur on the sidebar and header | Decorative blur. | Blur is used only behind the drawer, the palette and dialogs. |
| Inter for Latin | A default choice. | IBM Plex Sans Arabic carries both scripts, with Alexandria for display. |
| Every section faded in | Generic motion. | There is one load moment: the reel frames "develop" from overexposed to normal, left to right in reading order. Everything else moves only in response to an action. |

## 4. Post-build critique

- The removed accessory: a grain-noise overlay on the reel. It added texture but cost
  legibility of the date numerals in light mode, and the sprocket rule already says
  "film". It is gone.
- Watch: the light theme's amber needed darkening to `#8A5A00` to pass AA on paper.
