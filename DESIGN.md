# TimeYourWOD — Design Doc

A description of the web app as it actually stands today (not the historical rebuild plan in `TimeYourWOD-Design-Doc.docx`). This doc complements the README — README explains *how to use it*, this explains *how it works*.

---

## 1. Goals

- **Legible from across a gym floor on a TV.** Big tabular numerals, no jitter, monochrome with a single functional red.
- **Thumb-friendly on a phone.** All controls ≥ 44px target; the timer body itself is a tap target for pause; a hot-corner doubles as reset.
- **Distraction-free running view.** Once you press START, the screen is just the time, the round, the phase, and a thin progress rail. No chrome, no decoration.
- **Configurable workouts beyond the canned modes.** The `COMPLEX` builder lets a user assemble nested loops × rounds × intervals, save them as named templates, and reload them.
- **PWA + offline.** Service worker pre-caches the shell and every beep MP3 so a workout completes even if the network drops.
- **Native iOS companion** linked via a one-time install modal on mobile web.

---

## 2. Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 5 (TS) |
| Framework | React 18 |
| Routing | React Router 6 |
| Styling | Hand-rolled CSS with custom properties; no UI kit |
| State | A single `SettingsContext`; everything else is local component state |
| Persistence | `localStorage` (settings + Complex templates); `sessionStorage` only for the rotate hint |
| Audio | Plain `HTMLAudioElement` instances per beep, primed by an iOS unlock dance |
| Analytics | `gtag.js` loaded in `index.html`, fired manually on route change via `pageview()` |
| Install prompt | Bespoke modal linking to the App Store, dismissal persisted in `localStorage` |

No state library, no styling library. The whole app is React + standard DOM APIs.

---

## 3. Design tokens

All visual primitives live in `:root` / `:root[data-theme='light']` blocks in `src/index.css`:

```
--bg, --bg-soft, --bg-elev      backgrounds (3 elevations)
--fg, --fg-dim, --line          foregrounds + hairlines
--accent                        = var(--fg) — neutral by design
--alert         #c43c3c         the ONLY red; used for overtime scoreboard
--overlay                       rgba dark in dark theme / rgba light in light theme
--font-mono                     JetBrains Mono + monospace stack
--font-display                  ui-sans-serif system stack (used for the wordmark only)
--safe-{t,r,b,l}                env(safe-area-inset-*) plumbing
```

The theme switch is a single `data-theme="light"` attribute on `<html>`, set by `SettingsProvider` based on the persisted theme.

---

## 4. Routing

```
/                  Home — six mode buttons + About/Privacy links
/clock             Clock — wall clock / stopwatch
/tabata            Tabata setup → running
/for-time          For Time setup → running
/emom              EMOM setup → running
/amrap             AMRAP setup → running
/complex           Complex builder → running
/about             Long-form about page + Donate CTA
/privacy-policy    11-section privacy policy
```

`<PageView />` is mounted globally and fires a GA `page_view` on every `location.pathname` change.

---

## 5. State

### Global — `SettingsContext`

```ts
interface Settings {
  theme: 'dark' | 'light';
  heatsEnable: boolean;
  heatsDelay: number;   // seconds
  fortime: number;      // overtime seconds, 0 = off
  selectBeep: number;   // BEEP_PACK id
}
```

Hydrated from `localStorage['app-settings']` on first mount; persisted on every update. The audio bundle (`beep1`, `beep2`, `beep3`, `finalBeep`) is rebuilt whenever `selectBeep` changes — each entry is a fresh `new Audio(src)` with `preload = 'auto'`.

### Per-screen — local React state

Each timer screen owns its own `{ running, paused, ended, elapsed }` and uses a 1 Hz `setInterval` to drive `elapsed`. Complex additionally holds `loops`, `templates`, and three modal-control booleans (save / overwrite / delete).

---

## 6. Audio

```ts
const buildAudio = (packId) => ({
  beep1: new Audio(pack.files[0]),
  beep2: new Audio(pack.files[1]),
  beep3: new Audio(pack.files[2]),
  finalBeep: new Audio(pack.files[3]),
});
```

Each beep is a separate `HTMLAudioElement`, even when the pack's files map several slots to the same MP3 — that lets us fire them back-to-back without resetting `currentTime` mid-play.

### iOS unlock

iOS Safari refuses to play audio until the user gestures on a page. `unlockAudio()` runs on the first START / preview click:

1. Mute every audio element.
2. Call `play()` on each. Awaiting the promise marks the audio "user-initiated".
3. On resolve: pause, reset `currentTime`, unmute.

After that, programmatic `play()` works for the rest of the session.

### Beep cadence

Every interval boundary (and the initial pre-count) fires the same pattern at 3, 2, 1, 0 seconds remaining: `beep1, beep2, beep3, finalBeep`. The settings drawer's `PREVIEW 3 · 2 · 1 · GO` button plays this exact sequence with 1-second spacing using `setTimeout`s tracked in a ref, so they can be cancelled when the drawer closes or the pack changes.

---

## 7. Timer runtime

Two of the timer screens (Tabata, EMOM) walk a fixed cycle; the rest (For Time, AMRAP) just run a single phase. **Complex** walks a flat timeline that's built from its nested data model.

### `computeHeat(offset)` pattern

Every running screen implements a `computeHeat(offset: number)` that takes a seconds offset and returns:

```ts
interface HeatState {
  display: string;          // "MM:SS" or single digit during pre-count
  phase: 'WORK' | 'REST' | null;
  round?: number;
  beep: 'b1' | 'b2' | 'b3' | 'final' | null;
  finished: boolean;
  // …per-screen extras (e.g. overtime: boolean, label: string)
}
```

The function dispatches on `rel = elapsed - offset`:

- `rel < 0` — heat hasn't started; show MM:SS until its GO (so heat 2 counts down through the heats delay).
- `0 ≤ rel < 10` — pre-count phase; show single digit and emit `b1 / b2 / b3` at remaining 3 / 2 / 1, `final` at 0.
- `10 ≤ rel < totalSeconds + 10` — running phase; walk the screen-specific timeline.
- `rel ≥ totalSeconds + 10` — finished.

`heat1 = computeHeat(0)`, `heat2 = computeHeat(heatsDelay)` (only when heats are enabled). Both display states feed identical-size `<TimerDisplay>`s with reserved slot placeholders, so heat 1 and heat 2 always occupy the same vertical footprint.

### Beep deduplication

Beeps are state-derived (each call to `computeHeat` reports what *should* be playing right now), so a tuple `${heatId}:${elapsed}:${beep}` is tracked in a `Set<string>` ref. Once a tuple has fired, it can't fire again — protects against React effects re-running with the same `elapsed`.

---

## 8. Complex builder

### Data model

```ts
interface Interval { id: string; label: string; work: number; rest: number; }
interface Loop     { id: string; rounds: number; intervals: Interval[]; transitionRest: number; }
type Workout       = Loop[];
```

`id` is `Math.random().toString(36).slice(2, 10)` — stable across re-orders, fresh on duplicate/load (template loads re-ID every entity so React keys don't collide).

### Timeline construction (`buildTimeline`)

```
for each loop:
  for r = 1..loop.rounds:
    for each interval iv:
      if iv.work > 0:  push WORK(iv.work, label=iv.label)
      if iv.rest > 0:  push REST(iv.rest)
  if loop.transitionRest > 0 AND loop is not last:
    push REST(loop.transitionRest, label='TRANSITION')
```

The result is a flat `Seg[]` that `computeHeat` walks. Total duration is `segs.reduce((a, s) => a + s.duration, 0)`.

### Editor layout

`Complex.tsx` deliberately doesn't use `SetupShell` — it has its own `.complex-shell` with three flex zones:

- **Top, sticky:** the `COMPLEX` title under a 1px hairline.
- **Middle, scrolling:** the loops list, `+ ADD LOOP`, and the templates row. `flex: 1; min-height: 0; overflow-y: auto` so this is the only area that scrolls.
- **Bottom, sticky:** `START` button + `Total · MM:SS` caption.

Inside a loop card: a header (`LOOP 01` + ↑ ↓ ⎘ × controls), a centered `FOR n ROUNDS` form-stack row, an `Intervals` heading, the interval rows, an `+ ADD INTERVAL` button, and (for all but the last loop) a `THEN REST n SECONDS` row above a hairline.

Each interval row is a 4-column grid (`[index] [Work·sec] [Rest·sec] [↑ ↓ ×]`) on desktop. On phone the controls drop to a second sub-row below the inputs to keep tap targets generous.

### Templates

```
localStorage['complex-templates-v1'] = JSON.stringify({ [name]: Workout })
```

Selection alone is inert — the user has to hit **LOAD** to populate the builder. **SAVE** opens a styled modal that captures a name; if the name collides with an existing template, a second modal asks `Replace template?`. **DELETE** opens a third modal asking `Delete template?`. All three modals share `.modal-backdrop` + `.modal` + `.modal__*` styles.

Escape closes the top-most modal; clicking the backdrop closes; clicking inside the card stops propagation.

---

## 9. Layout primitives

### `SetupShell`

Used by Tabata / EMOM / AMRAP / For Time. Centers a title and the form-stack children both horizontally and vertically inside a `100vh` flex column (`justify-content: center`).

### `.form-stack`

```
grid-template-columns: minmax(80px, 130px)
                       minmax(180px, 260px)
                       minmax(80px, 130px);
```

Symmetric side columns so the input box (column 2) sits at the row center. `FieldRow` is a React fragment that drops `[span.form-stack__prefix, input.form-stack__input, span.form-stack__suffix]` directly into the grid. The START button (`button.form-stack__action`) explicitly takes `grid-column: 2` so it lands under the inputs.

### `TimerScreen`

The running view. Layout:

```
┌──────────────────────────────────┐
│ ▓▓░░░░░░░░░░░░░░░░  progress rail │  fixed top, 3px
├──────────────────────────────────┤
│         ● LIVE / ❚❚ PAUSED       │  small indicator, top center
│                                  │
│   HEAT 1            HEAT 2       │  equal grid cells (1fr 1fr)
│   ROUND 02          ROUND 02     │
│   WORK              WORK         │
│   00:30             00:30        │
│                                  │
├──────────────────────────────────┤
│   end-time projections / status  │  belowTimer slot
└──────────────────────────────────┘
```

Heats use CSS grid (`gridAutoRows: 1fr; gridTemplateColumns: 1fr 1fr`) so both cells are physically the same size regardless of content.

### Paused overlay

Absolutely positioned over the heat grid, `var(--overlay)` background, `backdrop-filter: blur(4px)`. The content is wrapped in a bordered `var(--bg)` card containing the ❚❚ icon, big `PAUSED` text, and a `Tap to resume` caption. `pointer-events: none` on the overlay so the underlying tap-to-resume still works.

### `TimerDisplay`

The label / round / phase rows are always rendered, even when empty — they use `visibility: hidden` with a placeholder when the corresponding prop is absent. This guarantees heat 1 and heat 2 always occupy the same vertical space.

---

## 10. PWA + service worker

`public/service-worker.js`, registered on initial render. Cache version `timeyourwod-v3`. On `install` it pre-caches:

```
/, /index.html, /manifest.json
favicon assets (.ico + 4 PNG sizes)
apple-touch-icon, android-chrome × 2
all 6 audio MP3s
```

`fetch` is cache-first: serve from cache if available, else fetch and put a copy in. On `activate` it purges any older cache version.

The manifest declares both 192 and 512 px PNGs with `purpose: "any"` plus a `512x512 maskable` entry so Android/Chrome render the icon correctly inside adaptive masks.

---

## 11. Mobile install prompt

`InstallPrompt.tsx` mounts globally inside `<Router>`. Conditions to show:

```
breakpoint === 'phone'
&& !displayMode-standalone
&& !navigator.standalone           (iOS)
&& localStorage[DISMISS_KEY] !== 'true'
```

After ~600 ms it opens a centered modal (same `.modal-backdrop` + `.modal` chassis) with the app icon, name, App Store sub-line, body copy, `Get the App` (opens the App Store URL in a new tab), and `Not now`. Either action — plus backdrop click and Escape — sets `localStorage[install-prompt-dismissed-v1] = 'true'`, so the modal is **permanently disabled** on that device after a single interaction.

Both actions also fire GA events (`install_prompt_click` / `install_prompt_dismiss`).

---

## 12. Persistence summary

| Key                              | Storage         | What                                              |
| -------------------------------- | --------------- | ------------------------------------------------- |
| `app-settings`                   | localStorage    | Theme, heats config, overtime, beep pack id       |
| `complex-templates-v1`           | localStorage    | Named Complex workout templates                   |
| `install-prompt-dismissed-v1`    | localStorage    | One-shot mobile install modal dismissal           |
| `rotate-hint-dismissed`          | sessionStorage  | Portrait phone hint                               |
| `updatePopupExited_v1`           | localStorage    | One-shot "starter build" banner on Home          |

---

## 13. Configuration touch points

External services / accounts are isolated to four locations so a fork / rebrand is straightforward:

1. **Google Analytics Measurement ID** — `index.html` (script `src` and the `gtag('config', …)` call) and `src/lib/gtag.ts` (`GA_ID` constant). All `pageview()` and `event()` calls no-op while the ID is still the placeholder `G-XXXXXXXXXX`.
2. **Ko-fi username** — `kofiWidgetOverlay.draw('timeyourwod', …)` in `index.html`.
3. **App Store URL** — `APP_STORE_URL` constant in `src/components/InstallPrompt.tsx`.
4. **Icon set** — replace the PNGs in `public/` and the manifest entries in `public/manifest.json`.

---

## 14. Out of scope (current site)

The original rebuild plan in `TimeYourWOD-Design-Doc.docx` proposed React Native + Expo for a unified web/iOS/Android codebase. That plan was not taken — the web stays Vite/React, and the iOS app is a separate native build distributed through the App Store. The two products share branding, beep audio, and the workout philosophy, but not the code.

If/when Android joins the lineup, the `InstallPrompt` modal would gain a Play Store branch and the conditional render would split on `navigator.userAgent`.
