# TimeYourWOD — starter build

A WOD timer web app: six modes (Clock, Tabata, For Time, EMOM, AMRAP, Complex), heats, custom beeps, dark/light themes, fullscreen, wake-lock, PWA-ready. Built with **React 18 + TypeScript + Vite + React Router**.

Designed to be legible from across a gym floor on a TV **and** thumb-friendly on a phone.

## Run it

```bash
npm install
npm start          # or: npm run dev
```

App boots on http://localhost:3000.

```bash
npm run build      # production build to /dist
npm run preview    # preview the production build
```

## Test on your phone

Vite is configured with `host: true`, so once `npm start` is running, open `http://<your-laptop-ip>:3000` on your phone (same Wi-Fi). The app is responsive at every breakpoint:

| Breakpoint | Width      | Behavior                                                                 |
| ---------- | ---------- | ------------------------------------------------------------------------ |
| phone      | ≤ 559 px   | Footer hidden, tighter padding, heats stack vertically in portrait       |
| tablet     | 560–900 px | Full footer, side-by-side heats in landscape, stacked in portrait        |
| desktop    | > 900 px   | Full experience — tuned for big screens and gym TVs                      |

Portrait phone users see a non-blocking "↻ Rotate for the full scoreboard" hint that they can dismiss; the app is **fully usable** in portrait regardless.

## How the timers work

- Every timer starts with a **10-second pre-countdown**. Beeps fire at 3, 2, 1, with a distinct final "GO" beep.
- The same 3-2-1 + final beep pattern fires at the end of every active interval.
- **Tap the timer** to pause/resume.
- **Tap the invisible top-left hot-corner** (20% × 20% of the screen) to reset.
- When the workout completes, a status line + RESTART button appear.

### Heats (global setting)

Enable in the cog → Settings drawer. The second timer starts after the configured delay, and end-times for both heats are projected below the timer.

### Overtime (For Time)

Set in Settings → "For Time → Overtime". When the cap is hit the clock turns red and counts upward through the overtime window before ending.

## Replacing the beep audio

Drop your own audio files into:

```
public/Audio/default/
  Beep.wav         # used for 3, 2, 1
  FinishBeep.wav   # used for "GO" / interval end / final
public/Audio/second/
  Beep1.wav        # alternative — used for 3
  Beep2.wav        # used for 2
  Beep3.wav        # used for 1
  FinalBeep.wav    # used for GO / final
```

Any browser-playable format works (.wav, .mp3, .ogg). If you change extensions or add packs, edit `BEEP_PACKS` in `src/contexts/SettingContext.tsx`.

The starter ships with synthesized placeholder beeps so the project runs out of the box — replace them.

## Project layout

```
public/
  Audio/default/*    # default beep pack
  Audio/second/*     # alternate beep pack
  manifest.json      # PWA manifest
  service-worker.js  # offline cache
  favicon.svg
src/
  App.tsx
  main.tsx
  index.css          # design tokens + global styles
  vite-env.d.ts
  contexts/
    SettingContext.tsx
  hooks/
    useViewport.ts
    useWakeLock.ts
    useTimerFontSize.ts
  lib/
    gtag.ts
    timer-utils.ts
  components/
    Button.tsx
    ButtonCMD.tsx
    CustomFooter.tsx
    CustomHeader.tsx
    CustomTimePicker.tsx
    KoFiPopUp.tsx
    PageView.tsx
    RotateHint.tsx
    SetupShell.tsx
    SideDrawer.tsx
    TimerDisplay.tsx
    TimerScreen.tsx
    Toggle.tsx
    UpdatePopUp.tsx
  screens/
    About.tsx
    Amrap.tsx
    Clock.tsx
    Complex.tsx
    Emom.tsx
    ForTime.tsx
    Home.tsx
    PrivacyPolicy.tsx
    Tabata.tsx
```

## Design notes

- **Monospace everywhere.** JetBrains Mono is loaded from Google Fonts. Timer numerals use `font-variant-numeric: tabular-nums` so digits don't jitter.
- **Accent color** is oxblood `#c43c3c`, used only for state (overtime, running indicators, primary action buttons).
- **Background** is a low-contrast dot grid + scan-line pattern — terminal/scoreboard energy without overpowering the timer.
- **Corner crosshairs** on the running timer give it a "viewfinder" feel.
- **REC dot** blinks while a timer is live, switches to "PAUSED" when paused.
- **Progress rail** at the top of the screen fills as the workout progresses.

## Notes on mobile

- **Audio unlock**: the first START tap unlocks the audio context (required by iOS Safari).
- **Wake-lock**: the Screen Wake Lock API is requested when a timer is live, released on pause/reset. Falls back gracefully on browsers that don't support it.
- **Safe areas**: the layout respects `env(safe-area-inset-*)` so headers/footers don't get eaten by notches or home indicators.
- **PWA**: the manifest + service worker mean you can "Add to Home Screen" and it'll run offline.

## License

MIT — do whatever, keep the copyright if you redistribute.
