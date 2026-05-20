import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type Theme = 'light' | 'dark';

export interface BeepPack {
  id: number;
  name: string;
  files: [string, string, string, string]; // beep1, beep2, beep3, finalBeep
}

export const BEEP_PACKS: BeepPack[] = [
  {
    id: 0,
    name: 'DEFAULT',
    files: [
      '/Audio/default/Beep.mp3',
      '/Audio/default/Beep.mp3',
      '/Audio/default/Beep.mp3',
      '/Audio/default/FinalBeep.mp3',
    ],
  },
  {
    id: 1,
    name: 'SIMPLE',
    files: [
      // Re-encoded as PCM WAV with leading silence trimmed (source MP3s had
      // ~190ms of silence baked into the head).
      '/Audio/second/Beep1.wav',
      '/Audio/second/Beep2.wav',
      '/Audio/second/Beep3.wav',
      '/Audio/second/FinalBeep.wav',
    ],
  },
];

export interface Settings {
  theme: Theme;
  heatsEnable: boolean;
  heatsDelay: number; // seconds
  fortime: number; // overtime seconds; 0 = off
  selectBeep: number;
}

interface PersistedSettings extends Settings {}

const STORAGE_KEY = 'app-settings';

const defaultSettings: Settings = {
  theme: 'dark',
  heatsEnable: false,
  heatsDelay: 60,
  fortime: 0,
  selectBeep: 0,
};

interface AudioBundle {
  beep1: HTMLAudioElement;
  beep2: HTMLAudioElement;
  beep3: HTMLAudioElement;
  finalBeep: HTMLAudioElement;
}

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  audio: AudioBundle;
  unlockAudio: () => void;
  audioUnlocked: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
};

const loadFromStorage = (): Settings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

const buildAudio = (packId: number): AudioBundle => {
  const pack = BEEP_PACKS.find((p) => p.id === packId) ?? BEEP_PACKS[0];
  const a = (src: string) => {
    const el = new Audio(src);
    el.preload = 'auto';
    return el;
  };
  return {
    beep1: a(pack.files[0]),
    beep2: a(pack.files[1]),
    beep3: a(pack.files[2]),
    finalBeep: a(pack.files[3]),
  };
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(loadFromStorage);
  const [audio, setAudio] = useState<AudioBundle>(() => buildAudio(loadFromStorage().selectBeep));
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // theme attribute on <html> for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // rebuild audio when beep pack changes
  useEffect(() => {
    setAudio(buildAudio(settings.selectBeep));
  }, [settings.selectBeep]);

  // iOS / mobile audio unlock — must be called from a user gesture
  const unlockAudio = () => {
    if (audioUnlocked) return;
    const all = [audio.beep1, audio.beep2, audio.beep3, audio.finalBeep];
    all.forEach((el) => {
      try {
        el.muted = true;
        const p = el.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            el.pause();
            el.currentTime = 0;
            el.muted = false;
          }).catch(() => {
            el.muted = false;
          });
        }
      } catch {}
    });
    setAudioUnlocked(true);
  };

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, audio, unlockAudio, audioUnlocked }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, audio, audioUnlocked]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
