import React, { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, type AVPlaybackSource } from 'expo-av';

export type Theme = 'light' | 'dark';

export interface BeepPack {
  id: number;
  name: string;
  files: [AVPlaybackSource, AVPlaybackSource, AVPlaybackSource, AVPlaybackSource];
}

// Beep audio is bundled into the app — require() returns an asset module id that expo-av understands.
export const BEEP_PACKS: BeepPack[] = [
  {
    id: 0,
    name: 'DEFAULT',
    files: [
      require('../assets/audio/default/Beep.mp3'),
      require('../assets/audio/default/Beep.mp3'),
      require('../assets/audio/default/Beep.mp3'),
      require('../assets/audio/default/FinalBeep.mp3'),
    ],
  },
  {
    id: 1,
    name: 'SIMPLE',
    files: [
      // Re-encoded as PCM WAV with leading silence trimmed (source MP3s had
      // ~190ms of silence at the head, which made beeps audibly land late).
      require('../assets/audio/second/Beep1.wav'),
      require('../assets/audio/second/Beep2.wav'),
      require('../assets/audio/second/Beep3.wav'),
      require('../assets/audio/second/FinalBeep.wav'),
    ],
  },
];

export interface Settings {
  theme: Theme;
  heatsEnable: boolean;
  heatsDelay: number;
  fortime: number;
  selectBeep: number;
}

const STORAGE_KEY = 'app-settings';

const defaultSettings: Settings = {
  theme: 'dark',
  heatsEnable: false,
  heatsDelay: 60,
  fortime: 0,
  selectBeep: 0,
};

interface AudioBundle {
  beep1: Audio.Sound | null;
  beep2: Audio.Sound | null;
  beep3: Audio.Sound | null;
  finalBeep: Audio.Sound | null;
  play: (which: 'b1' | 'b2' | 'b3' | 'final') => Promise<void>;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  audio: AudioBundle;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [, forceRender] = useState(0);
  const soundsRef = useRef<{
    b1: Audio.Sound | null;
    b2: Audio.Sound | null;
    b3: Audio.Sound | null;
    final: Audio.Sound | null;
  }>({ b1: null, b2: null, b3: null, final: null });

  // hydrate from storage
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw) as Partial<Settings>;
          setSettings((s) => ({ ...s, ...parsed }));
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings]);

  // configure audio session once — locked-screen playback + silent-mode bypass
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  // (re)load beep sounds whenever the selected pack changes
  useEffect(() => {
    const pack = BEEP_PACKS.find((p) => p.id === settings.selectBeep) ?? BEEP_PACKS[0];
    let cancelled = false;

    const load = async () => {
      // unload anything previously loaded
      const { b1, b2, b3, final } = soundsRef.current;
      await Promise.all(
        [b1, b2, b3, final].map((s) => (s ? s.unloadAsync().catch(() => {}) : Promise.resolve()))
      );
      if (cancelled) return;

      try {
        const [s1, s2, s3, sf] = await Promise.all([
          Audio.Sound.createAsync(pack.files[0], { shouldPlay: false }),
          Audio.Sound.createAsync(pack.files[1], { shouldPlay: false }),
          Audio.Sound.createAsync(pack.files[2], { shouldPlay: false }),
          Audio.Sound.createAsync(pack.files[3], { shouldPlay: false }),
        ]);
        if (cancelled) {
          await Promise.all([s1, s2, s3, sf].map((x) => x.sound.unloadAsync().catch(() => {})));
          return;
        }
        soundsRef.current = {
          b1: s1.sound,
          b2: s2.sound,
          b3: s3.sound,
          final: sf.sound,
        };
        forceRender((n) => n + 1);
      } catch {
        // audio assets might not exist yet during initial scaffold — fail silently
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [settings.selectBeep]);

  const audio = useMemo<AudioBundle>(
    () => ({
      get beep1() {
        return soundsRef.current.b1;
      },
      get beep2() {
        return soundsRef.current.b2;
      },
      get beep3() {
        return soundsRef.current.b3;
      },
      get finalBeep() {
        return soundsRef.current.final;
      },
      play: async (which) => {
        const sound =
          which === 'b1'
            ? soundsRef.current.b1
            : which === 'b2'
              ? soundsRef.current.b2
              : which === 'b3'
                ? soundsRef.current.b3
                : soundsRef.current.final;
        if (!sound) return;
        try {
          await sound.replayAsync();
        } catch {}
      },
    }),
    []
  );

  const updateSettings = (partial: Partial<Settings>) =>
    setSettings((prev) => ({ ...prev, ...partial }));

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, audio }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, audio]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};
