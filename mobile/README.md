# TimeYourWOD — Native (iOS + Android)

React Native + Expo (SDK 52, expo-router 4) build of TimeYourWOD. One codebase ships to the App Store and Google Play. The web app lives at the repo root; this folder is fully independent.

## What's in here

```
mobile/
  app/                       expo-router file-based routes
    _layout.tsx              root Stack + Providers
    (tabs)/                  bottom tabs: Timers / Saved / About
      _layout.tsx
      index.tsx              Home — six mode buttons
      saved.tsx              Saved Timers list
      about.tsx              About + Donate
    clock.tsx                wall clock / stopwatch
    tabata.tsx               full mode — setup + running view (reference impl)
    for-time.tsx, amrap.tsx, emom.tsx, complex.tsx   stubs ("Coming soon")
  components/
    ModeButton.tsx           Home nav button
    CmdButton.tsx            primary / ghost action button
    FieldRow.tsx             PREFIX  [ input ]  SUFFIX setup row
    TimerDisplay.tsx         scoreboard digits + label/round/phase
    TimerScreen.tsx          running view chrome (progress, hot-corner, pause overlay)
    SaveModal.tsx            name + overwrite confirm dialog
    ComingSoon.tsx           placeholder for unported modes
  contexts/
    SettingsContext.tsx      theme + heats + beep pack + expo-av audio bundle
    SavedTimersContext.tsx   unified saved-timers-v1 AsyncStorage store
  shared/                    PORTED FROM WEB — pure logic, no React
    timer-utils.ts           COUNTDOWN_TIME, formatMMSS, beepFor
    types.ts                 Mode / SavedTimer / config types
    complex-timeline.ts      buildTimeline / timelineTotal for Complex
  theme/                     design tokens + useTheme hook
  assets/audio/              beep MP3s (copied from web public/Audio/)
```

## Run it

```bash
cd mobile
npm install                # or pnpm i / yarn
npx expo start             # opens the Expo dev server
```

Then either:

- **iOS simulator**: press `i` in the terminal (requires Xcode + simulators installed).
- **Android emulator**: press `a` (requires Android Studio + a running AVD).
- **Physical device**: install the Expo Go app, scan the QR code from the dev server.

`npm run typecheck` runs `tsc --noEmit` against the strict TS config.

## What works today

- Bottom tab nav: **Timers / Saved / About**.
- Home screen with the six mode buttons.
- **Tabata** end-to-end — FOR / WORK / REST setup, header SAVE button → unified `saved-timers-v1` store, START → countdown → workout → end. Pause overlay, screen wake-lock, heats, beep cadence.
- **Clock** — wall clock ticking.
- **Saved Timers** list — search, recent-first, tap to load into a mode, long-press to delete.
- **About** with Ko-fi + web links.
- Dark/light theme tokens hooked up; theme switch UI lives in the Settings drawer (next step).

## What's left (in priority order)

1. **Settings drawer / screen** — theme toggle, heats config (with the same MM:SS picker shape as the web), overtime, beep pack selector + 3-2-1-GO preview. Should be reachable from a cog in the header of every screen.
2. **For Time / AMRAP / EMOM** — port from web, follow `tabata.tsx` as the reference. Each is ~150 lines.
3. **Complex builder** — port the loop / interval data model + builder UI. The runtime is already in `shared/complex-timeline.ts`.
4. **App icon + splash assets** — currently the `assets/` folder needs `icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`. The web's `android-chrome-512x512.png` is a good starting point.
5. **Haptics** — `expo-haptics` light tap on every 3-2-1 beep, heavier hit on GO and end-of-workout.
6. **EAS Build + Submit** — `npm i -g eas-cli && eas init`, then `eas build -p ios|android --profile preview` for internal testing, and `eas submit` for store delivery.

## Conventions

- **No web-specific code reused directly.** All shared logic lives in `shared/` as pure TS.
- **Theme tokens always via `useTheme()`** — never hard-code colors in StyleSheets.
- **One screen per mode** in `app/`. Setup + running views are conditional renders inside the same route, mirroring the web.
- **Saved Timers writes the unified store, not per-mode keys.** This is intentional — see `DESIGN.md` § 14 in the repo root.

## License

MIT — same as the web.
