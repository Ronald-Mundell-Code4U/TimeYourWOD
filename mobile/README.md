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
`npm test` runs the Jest suite (see **Tests** below).

## What works today

All six modes are fully implemented (setup + running view), not stubs:

- Bottom tab nav: **Timers / Saved / About**.
- Home screen with the six mode buttons.
- **Clock** — wall clock + stopwatch.
- **Tabata / For Time / AMRAP / EMOM** — full setup, header SAVE → unified `saved-timers-v1` store, START → 10s countdown → workout → end. Pause overlay, hot-corner reset, screen wake-lock, heats, 3-2-1-GO beep cadence + matched haptics.
- **Complex** — loop/interval builder + runtime (`shared/complex-timeline.ts`), save/load.
- **Saved Timers** list — search, recent-first, tap to load into the matching mode, long-press to delete.
- **Settings** screen — theme toggle, heats + delay picker, For Time overtime, beep pack selector + 3-2-1-GO preview.
- **About** with Ko-fi + web links.
- Dark/light theme tokens throughout.

## Tests

`npm test` (jest-expo + @testing-library/react-native). 59 tests across 7 suites:

- `shared/__tests__/` — `timer-utils`, `complex-timeline`, `useTimerEngine` (monotonic clock + beep dedup), and `types` (compile-time discriminated-union assertions).
- `contexts/__tests__/SavedTimersContext` — save / overwrite / rename / duplicate / remove / markRun + AsyncStorage persistence.
- `app/__tests__/screens` — smoke render of all 10 screens.
- `app/__tests__/saved-timers-flow` — end-to-end Saved Timers: save → overwrite-collision → list → load-into-mode (incl. `fortime`→`/for-time`) → prefill → markRun-on-START.

Native modules (AsyncStorage, expo-av, expo-haptics, expo-keep-awake, expo-router, vector-icons) are mocked in `jest.setup.ts`.

## What's left (in priority order)

1. **App icon + splash assets** — the `assets/` folder needs `icon.png`, `adaptive-icon.png`, `splash.png`, `favicon.png`. The web's `android-chrome-512x512.png` is a good starting point.
2. **Bundle JetBrains Mono** — `theme/index.ts` references `JetBrainsMono_700Bold` but the font isn't loaded (falls back to system mono); add `@expo-google-fonts/jetbrains-mono` + `useFonts` for scoreboard parity with the web.
3. **EAS Build + Submit** — `npm i -g eas-cli && eas init`, then `eas build -p ios|android --profile preview` for internal testing, and `eas submit` for store delivery.

> Tech debt: `expo-av` is deprecated in SDK 52 (superseded by `expo-audio`); migrate when convenient.

## Conventions

- **No web-specific code reused directly.** All shared logic lives in `shared/` as pure TS.
- **Theme tokens always via `useTheme()`** — never hard-code colors in StyleSheets.
- **One screen per mode** in `app/`. Setup + running views are conditional renders inside the same route, mirroring the web.
- **Saved Timers writes the unified store, not per-mode keys.** This is intentional — see `DESIGN.md` § 14 in the repo root.

## License

MIT — same as the web.
