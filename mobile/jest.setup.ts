// Global test setup: mock native modules so screens/logic run headlessly under jest.
import { act } from '@testing-library/react-native';

// Deterministic no-op rAF: starting a timer in a screen test won't spin a real
// animation loop. Engine unit tests install their own controllable rAF.
global.requestAnimationFrame = (() => 0) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = (() => {}) as unknown as typeof cancelAnimationFrame;

// Both providers hydrate from AsyncStorage on mount (async setState). Tests that
// render + assert synchronously don't await that; flush the pending microtasks
// inside act() after each test so the hydrate setState is wrapped (no warnings).
afterEach(async () => {
  await act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });
});


// @expo/vector-icons — render each icon as a <Text> with its name (avoids the
// expo-font native-font loading path, which throws under jest).
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ name, ...rest }: any) => React.createElement(Text, rest, name);
  return new Proxy({}, { get: () => Icon });
});

// expo-router — hooks + passthrough nav components. The router object is stashed
// on global so tests can assert on router.push. useLocalSearchParams reads a
// mutable global so individual tests can inject route params (e.g. savedId).
jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    setParams: jest.fn(),
    dismiss: jest.fn(),
  };
  (global as any).__ROUTER_MOCK__ = router;
  const RN = require('react');
  const passthrough = ({ children }: any) => children ?? null;
  passthrough.Screen = () => null;
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: () => (global as any).__ROUTER_PARAMS__ ?? {},
    useSegments: () => [],
    usePathname: () => '/',
    useNavigation: () => ({
      setOptions: jest.fn(),
      navigate: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      removeListener: jest.fn(),
    }),
    useFocusEffect: (cb: any) => RN.useEffect(cb, []),
    Link: ({ children }: any) => children ?? null,
    Redirect: () => null,
    Slot: passthrough,
    Stack: passthrough,
    Tabs: passthrough,
  };
});


// AsyncStorage — official in-memory jest mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Haptics — no-op, resolve immediately.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Keep-awake — no-op hook + imperative API.
jest.mock('expo-keep-awake', () => ({
  useKeepAwake: jest.fn(),
  activateKeepAwakeAsync: jest.fn(() => Promise.resolve()),
  deactivateKeepAwake: jest.fn(() => Promise.resolve()),
}));

// expo-av — Audio.Sound.createAsync rejects so SettingsProvider's load effect
// takes its silent catch branch (no post-render setState → no act() warning).
// Audio isn't exercised in tests; the timer engine is tested with a stubbed
// useSettings, so real sound loading is unnecessary here.
jest.mock('expo-av', () => {
  const createAsync = jest.fn(() => Promise.reject(new Error('audio disabled in tests')));
  return {
    Audio: {
      Sound: { createAsync },
      setAudioModeAsync: jest.fn(() => Promise.resolve()),
      setIsEnabledAsync: jest.fn(() => Promise.resolve()),
    },
    InterruptionModeIOS: { DoNotMix: 1, DuckOthers: 2, MixWithOthers: 0 },
    InterruptionModeAndroid: { DoNotMix: 1, DuckOthers: 2 },
  };
});
