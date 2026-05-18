# TimeYourWOD

Workout timer for the gym floor. Six modes, a full multi-loop Complex builder with saveable templates, heats support, two beep packs, dark/light themes, PWA install, and a companion iOS app.

- **Live web:** <https://timeyourwod.code4u.app>
- **iOS app:** <https://apps.apple.com/us/app/timeyourwod/id6698851328>

Built with **React 18 + TypeScript + Vite + React Router 6**. No state libraries, no UI kit — vanilla CSS variables + a single `SettingsContext`.

---

## Run it

```bash
npm install
npm start          # or: npm run dev — boots Vite on http://localhost:3000
npm run build      # tsc + vite build into /dist
npm run preview    # serve the production build
```

Vite is configured with `host: true`, so once `npm start` is running you can also open `http://<your-laptop-ip>:3000` on a phone on the same Wi-Fi.

---

## Modes

Six modes, all reached from Home:

| Mode      | What it does                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| Clock     | Wall clock or stopwatch. No countdown.                                       |
| Tabata    | `FOR n ROUNDS` of `WORK s` / `REST s`.                                       |
| For Time  | A capped timer with optional overtime (set in Settings).                     |
| EMOM      | `FOR n ROUNDS` of `EVERY s SECONDS` work, optional `REST s` between rounds.  |
| AMRAP     | A simple `FOR n MINUTES` countdown.                                          |
| Complex   | Multi-loop workout builder — see below.                                       |

Every timer starts with a **10-second pre-countdown** (beeps at 3, 2, 1 and a distinct final beep on GO). The same 3-2-1-GO cue fires at every interval boundary and at workout end.

### Pause, reset, restart

- **Tap the timer** to pause. A full-screen `PAUSED` overlay appears with a ❚❚ glyph and "Tap to resume" hint. Tap anywhere on the timer to resume.
- **Tap the invisible top-left hot-corner** (20% × 20% of the screen) to reset.
- When the workout completes, a status line and `RESTART` button appear below the timer.

---

## Complex builder

`COMPLEX` is a nested workout structure:

```
Workout
 └── Loop[]
      ├── Interval[]              (each: work + rest)
      ├── rounds                  (how many times the interval list repeats)
      └── transitionRest          (seconds appended after this loop, if it isn't the last)
```

A sticky title bar sits at the top, the **START** button + total duration sit pinned at the bottom, and the loops scroll between them. Inside a loop you can add / remove / reorder interval blocks (↑ ↓ ×), edit work/rest seconds, and set a per-loop round count and transition rest. Loops themselves can be reordered, duplicated, or deleted.

### Templates (web — Complex only)

On the web, the **only** mode with template save/load is Complex — Tabata / EMOM / AMRAP / For Time configure in seconds, so a templates layer isn't worth the screen real estate. Complex workouts on the other hand can take minutes to build, so they're saveable.

Persisted to `localStorage['complex-templates-v1']` as JSON. UI:

- Select a template from the dropdown — selection alone doesn't load anything.
- Hit **LOAD** to populate the builder with that template.
- Hit **SAVE** to capture the current workout as a new template (or overwrite an existing one — confirmed in a modal).
- Hit **DELETE** to remove the selected template (also modal-confirmed).

> **Native iOS / Android (Phase 2)** will add a dedicated **Saved Timers** screen that holds saved configs for *every* mode in one place — see [DESIGN.md § Phase 2](DESIGN.md#14-phase-2--react-native--expo-rebuild-planned). That UI is a mobile-only addition; the web stays Complex-only by design.

---

## Heats

Toggle from the cog → Settings → `HEATS`. When enabled, the workout runs as two parallel scoreboards offset by a configurable `Delay · MM:SS`. Both heats are pre-cached into the timeline so heat 2 displays a long countdown to its own GO while heat 1 is already running. On landscape screens the two heats sit side-by-side; on phone portrait they stack. Both heat displays always reserve the same vertical footprint so the layout never jitters.

End-time projections (`HEAT 1 ENDS · 14:32`) are shown below the timer when heats are enabled, falling back to a single `WORKOUT ENDS · …` line otherwise.

---

## Beep packs

Two packs ship in the box, configured in [`src/contexts/SettingContext.tsx`](src/contexts/SettingContext.tsx):

| Pack    | Files                                                              |
| ------- | ------------------------------------------------------------------ |
| DEFAULT | `Audio/default/Beep.mp3` × 3 + `Audio/default/FinalBeep.mp3`       |
| SIMPLE  | `Audio/second/Beep1/2/3.mp3` + `Audio/second/FinalBeep.mp3`        |

Pick which one is active in Settings → `BEEP PACK`. The **PREVIEW 3 · 2 · 1 · GO** button plays the entire sequence exactly as the running timer fires it.

Drop your own MP3/WAV/OGG into the matching folders and update the `files` array in `BEEP_PACKS`.

---

## Settings (cog drawer)

- **Theme** — `DARK` (default) / `LIGHT`. The accent (`--accent`) is just the foreground; the only red in the app is the For Time overtime scoreboard.
- **Heats** — toggle + a MM:SS picker for the delay between heat 1 and heat 2.
- **For Time → Overtime** — MM:SS picker. When the cap is hit the clock turns red and counts upward through the overtime window. Set to `00:00` to disable.
- **Beep pack** — dropdown + preview button.

All settings persist to `localStorage` under `app-settings`.

---

## Mobile install prompt + iOS app

On phones, a full-screen modal pops up shortly after page load offering the native iOS app on the App Store. After either action (`Get the App` or `Not now`) the modal is permanently disabled on that device — dismissal is persisted to `localStorage` under `install-prompt-dismissed-v1`. The modal is also suppressed when the page is already running as an installed PWA (`display-mode: standalone` or `navigator.standalone`).

The web app itself is also installable as a PWA via Add to Home Screen — the service worker (`public/service-worker.js`, currently `timeyourwod-v3`) caches the app shell, all icon assets, and every beep MP3 so the timer works offline.

---

## Configuration to update before deploy

Three spots reference external services / accounts and need to be set to your own values:

1. **Google Analytics Measurement ID** — currently `G-XXXXXXXXXX` in both:
   - [`index.html`](index.html) (script `src` + `gtag('config', …)` call)
   - [`src/lib/gtag.ts`](src/lib/gtag.ts) (the `GA_ID` constant)
2. **Ko-fi username** — currently `timeyourwod` in [`index.html`](index.html) (`kofiWidgetOverlay.draw('timeyourwod', …)`).
3. **App Store URL** — currently the production TimeYourWOD link in [`src/components/InstallPrompt.tsx`](src/components/InstallPrompt.tsx) as `APP_STORE_URL`.

The PWA manifest (`public/manifest.json`) is wired up to the included icon set (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png` with both `any` and `maskable` purposes). Replace the PNGs to rebrand.

---

## Project layout

```
public/
  Audio/
    default/Beep.mp3, FinalBeep.mp3
    second/Beep1.mp3, Beep2.mp3, Beep3.mp3, FinalBeep.mp3
  android-chrome-{192,512}x{192,512}.png
  apple-touch-icon.png
  favicon{.ico,.svg,-16x16.png,-32x32.png}
  manifest.json
  service-worker.js

src/
  App.tsx                           # Router + global components
  main.tsx                          # entry; mounts SettingsProvider
  index.css                         # design tokens, form-stack, modal, etc.
  contexts/
    SettingContext.tsx              # settings + audio bundle + iOS unlock
  hooks/
    useViewport.ts                  # width/height/breakpoint/orientation
    useWakeLock.ts                  # Screen Wake Lock API wrapper
    useTimerFontSize.ts             # responsive scoreboard sizing
  lib/
    gtag.ts                         # Google Analytics helper
    timer-utils.ts                  # COUNTDOWN_TIME, formatters, playSafe
  components/
    Button.tsx, ButtonCMD.tsx       # Home nav button + primary CMD button
    CustomHeader.tsx                # back / wordmark / cog
    CustomTimePicker.tsx            # MM:SS picker
    FieldRow.tsx                    # PREFIX [ input ] SUFFIX grid row
    InstallPrompt.tsx               # mobile App Store modal
    PageView.tsx                    # GA page_view tracker
    RotateHint.tsx                  # portrait phone hint
    SetupShell.tsx                  # title + centered form layout
    SideDrawer.tsx                  # cog settings drawer
    TemplatesPanel.tsx              # generic save/load/delete + modals for any mode
    TimerDisplay.tsx                # scoreboard digits + label/round/phase
    TimerScreen.tsx                 # progress rail + paused overlay + heat grid
    Toggle.tsx                      # binary toggle with reserved-width label
    UpdatePopUp.tsx                 # one-shot info banner
  screens/
    Home.tsx                        # 6 nav buttons + About/Privacy
    Clock.tsx, Tabata.tsx, ForTime.tsx, Emom.tsx, Amrap.tsx
    Complex.tsx                     # loops + intervals + templates builder
    About.tsx                       # long-form story + Donate CTA
    PrivacyPolicy.tsx               # 11-section policy
```

---

## Design notes

- **Monochrome by default.** `--accent` resolves to `--fg`, so every "accent" call site renders in plain white/black. The single hard-coded red is `--alert` (`#c43c3c`), used only for the overtime scoreboard.
- **Two type families.** Body, labels, buttons, and timer numerals are JetBrains Mono. The `TIMEYOURWOD` wordmark uses a proportional sans-serif (`--font-display`) so the W has its natural width — monospace W's get squeezed and read poorly at large sizes.
- **Tabular numerals.** The scoreboard sets `font-variant-numeric: tabular-nums` + `font-feature-settings: "tnum" 1, "zero" 1` so digits don't shift width when they change.
- **Form rows.** Every setup screen uses a `.form-stack` CSS grid with symmetric side columns so the `[ INPUT ]` and the `START` button align under each other.
- **Modals.** Save / overwrite / delete / install all share `.modal-backdrop` + `.modal`. Backdrop uses `var(--overlay)` (theme-aware: dark in dark mode, light in light mode). Escape and backdrop-click cancel; modals stack with Escape closing the top-most one first.
- **No decoration.** No scan lines, no dot grid, no corner crosshairs — let the type carry it.

---

## Mobile notes

- **Audio unlock** — calling `unlockAudio()` from the first user gesture mutes, plays, pauses, and unmutes each beep element, satisfying iOS Safari's "audio requires gesture" requirement. Triggered from each setup screen's `START` and from the preview button.
- **Wake lock** — the Screen Wake Lock API is requested when a timer is live and released on pause/reset/unmount. Falls back gracefully on browsers that don't expose it.
- **Safe areas** — `env(safe-area-inset-*)` is wired through `--safe-{t,r,b,l}` and used throughout the layout so headers, footers, modal padding, and the install prompt don't get eaten by notches or home indicators.
- **PWA** — the manifest + service worker mean Add to Home Screen produces a fullscreen, offline-capable app.

---

## License

MIT — do whatever, keep the copyright if you redistribute.
