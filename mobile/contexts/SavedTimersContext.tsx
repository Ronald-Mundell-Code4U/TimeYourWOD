import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { newId, type SavedTimer } from '../shared/types';

const STORAGE_KEY = 'saved-timers-v1';

interface Ctx {
  ready: boolean;
  timers: SavedTimer[];
  save: (input: Omit<SavedTimer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => SavedTimer;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => SavedTimer | null;
  markRun: (id: string) => void;
  findByName: (name: string) => SavedTimer | undefined;
}

const SavedTimersContext = createContext<Ctx | null>(null);

export const SavedTimersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timers, setTimers] = useState<SavedTimer[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            setTimers(JSON.parse(raw) as SavedTimer[]);
          } catch {}
        }
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (next: SavedTimer[]) => {
    setTimers(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const value = useMemo<Ctx>(
    () => ({
      ready,
      timers,
      save: (input) => {
        const now = Date.now();
        const existingIdx = input.id ? timers.findIndex((t) => t.id === input.id) : -1;
        const record: SavedTimer = {
          id: input.id ?? newId(),
          name: input.name,
          mode: input.mode,
          config: input.config,
          createdAt: existingIdx >= 0 ? timers[existingIdx].createdAt : now,
          updatedAt: now,
          lastRunAt: existingIdx >= 0 ? timers[existingIdx].lastRunAt : undefined,
        };
        const next =
          existingIdx >= 0
            ? timers.map((t, i) => (i === existingIdx ? record : t))
            : [...timers, record];
        persist(next);
        return record;
      },
      remove: (id) => persist(timers.filter((t) => t.id !== id)),
      rename: (id, name) =>
        persist(timers.map((t) => (t.id === id ? { ...t, name, updatedAt: Date.now() } : t))),
      duplicate: (id) => {
        const src = timers.find((t) => t.id === id);
        if (!src) return null;
        const copy: SavedTimer = {
          ...src,
          id: newId(),
          name: `${src.name} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastRunAt: undefined,
        };
        persist([...timers, copy]);
        return copy;
      },
      markRun: (id) =>
        persist(timers.map((t) => (t.id === id ? { ...t, lastRunAt: Date.now() } : t))),
      findByName: (name) => timers.find((t) => t.name === name),
    }),
    [timers, ready]
  );

  return <SavedTimersContext.Provider value={value}>{children}</SavedTimersContext.Provider>;
};

export const useSavedTimers = (): Ctx => {
  const ctx = useContext(SavedTimersContext);
  if (!ctx) throw new Error('useSavedTimers must be used inside SavedTimersProvider');
  return ctx;
};
