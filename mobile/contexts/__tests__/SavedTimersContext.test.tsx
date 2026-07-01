import React, { type ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedTimersProvider, useSavedTimers } from '../SavedTimersContext';
import type { TabataConfig } from '../../shared/types';

const STORAGE_KEY = 'saved-timers-v1';
const wrapper = ({ children }: { children: ReactNode }) => (
  <SavedTimersProvider>{children}</SavedTimersProvider>
);

const tabata = (over: Partial<TabataConfig> = {}): TabataConfig => ({
  rounds: 8,
  work: 30,
  rest: 10,
  ...over,
});

const renderStore = async () => {
  const hook = renderHook(() => useSavedTimers(), { wrapper });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('SavedTimersContext — load', () => {
  it('starts empty and becomes ready', async () => {
    const { result } = await renderStore();
    expect(result.current.timers).toEqual([]);
  });

  it('hydrates existing timers from AsyncStorage on mount', async () => {
    const seed = [
      { id: 'x', name: 'Seed', mode: 'amrap', config: { duration: 5 }, createdAt: 1, updatedAt: 1 },
    ];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const { result } = await renderStore();
    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].name).toBe('Seed');
  });
});

describe('SavedTimersContext — save (new)', () => {
  it('appends a new timer with generated id + timestamps and persists it', async () => {
    const { result } = await renderStore();
    let saved: any;
    await act(async () => {
      saved = result.current.save({ name: 'Cindy', mode: 'tabata', config: tabata() });
    });
    expect(result.current.timers).toHaveLength(1);
    expect(saved.id).toBeTruthy();
    expect(saved.createdAt).toBeGreaterThan(0);
    expect(saved.updatedAt).toBe(saved.createdAt);

    // persisted to storage
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toHaveLength(1);
  });
});

describe('SavedTimersContext — save (overwrite by id)', () => {
  it('replaces in place, preserves createdAt, bumps updatedAt, and does NOT duplicate', async () => {
    const { result } = await renderStore();
    let first: any;
    await act(async () => {
      first = result.current.save({ name: 'Fran', mode: 'tabata', config: tabata({ rounds: 8 }) });
    });

    await act(async () => {
      result.current.save({ id: first.id, name: 'Fran', mode: 'tabata', config: tabata({ rounds: 21 }) });
    });

    expect(result.current.timers).toHaveLength(1); // no duplicate
    const rec = result.current.timers[0];
    expect(rec.id).toBe(first.id);
    expect(rec.createdAt).toBe(first.createdAt); // preserved
    expect((rec.config as TabataConfig).rounds).toBe(21); // updated config
    expect(rec.updatedAt).toBeGreaterThanOrEqual(first.updatedAt);
  });
});

describe('SavedTimersContext — findByName (overwrite-collision helper)', () => {
  it('locates a timer by exact name so the UI can pass its id to overwrite', async () => {
    const { result } = await renderStore();
    let a: any;
    await act(async () => {
      a = result.current.save({ name: 'Grace', mode: 'amrap', config: { duration: 5 } });
    });
    expect(result.current.findByName('Grace')?.id).toBe(a.id);
    expect(result.current.findByName('nope')).toBeUndefined();
  });
});

describe('SavedTimersContext — rename / duplicate / remove / markRun', () => {
  it('renames a timer', async () => {
    const { result } = await renderStore();
    let t: any;
    await act(async () => {
      t = result.current.save({ name: 'Old', mode: 'amrap', config: { duration: 5 } });
    });
    await act(async () => result.current.rename(t.id, 'New'));
    expect(result.current.timers[0].name).toBe('New');
  });

  it('duplicates with a new id, "(copy)" suffix, and cleared lastRunAt', async () => {
    const { result } = await renderStore();
    let t: any;
    await act(async () => {
      t = result.current.save({ name: 'Base', mode: 'amrap', config: { duration: 5 } });
    });
    await act(async () => result.current.markRun(t.id));
    let copy: any;
    await act(async () => {
      copy = result.current.duplicate(t.id);
    });
    expect(result.current.timers).toHaveLength(2);
    expect(copy.id).not.toBe(t.id);
    expect(copy.name).toBe('Base (copy)');
    expect(copy.lastRunAt).toBeUndefined();
  });

  it('duplicate returns null for an unknown id', async () => {
    const { result } = await renderStore();
    let out: any = 'unset';
    await act(async () => {
      out = result.current.duplicate('missing');
    });
    expect(out).toBeNull();
  });

  it('removes a timer', async () => {
    const { result } = await renderStore();
    let t: any;
    await act(async () => {
      t = result.current.save({ name: 'Del', mode: 'amrap', config: { duration: 5 } });
    });
    await act(async () => result.current.remove(t.id));
    expect(result.current.timers).toHaveLength(0);
  });

  it('markRun stamps lastRunAt for recent-first ordering', async () => {
    const { result } = await renderStore();
    let t: any;
    await act(async () => {
      t = result.current.save({ name: 'Run', mode: 'amrap', config: { duration: 5 } });
    });
    expect(result.current.timers[0].lastRunAt).toBeUndefined();
    await act(async () => result.current.markRun(t.id));
    expect(result.current.timers[0].lastRunAt).toBeGreaterThan(0);
  });
});

describe('SavedTimersContext — persistence across remount', () => {
  it('survives a provider unmount/remount (data written to AsyncStorage)', async () => {
    const first = await renderStore();
    await act(async () => {
      first.result.current.save({ name: 'Persist', mode: 'emom', config: { rounds: 10, workTotal: 60, rest: 0 } });
    });
    first.unmount();

    const second = await renderStore();
    expect(second.result.current.timers).toHaveLength(1);
    expect(second.result.current.timers[0].name).toBe('Persist');
  });
});
