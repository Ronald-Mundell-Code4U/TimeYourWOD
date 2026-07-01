import React, { type ReactNode } from 'react';
import { Alert, Text } from 'react-native';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders, AllProviders, setRouteParams, clearRouteParams } from '../../test-utils';
import { SaveModal } from '../../components/SaveModal';
import { useSavedTimers } from '../../contexts/SavedTimersContext';
import type { SavedTimer, TabataConfig } from '../../shared/types';

import Saved from '../(tabs)/saved';
import Tabata from '../tabata';

const STORAGE_KEY = 'saved-timers-v1';
const router = () => (global as any).__ROUTER_MOCK__;

const seed = async (timers: Partial<SavedTimer>[]) => {
  const now = Date.now();
  const full = timers.map((t, i) => ({
    id: t.id ?? `id${i}`,
    name: t.name ?? `Timer ${i}`,
    mode: t.mode ?? 'tabata',
    config: t.config ?? { rounds: 8, work: 30, rest: 10 },
    createdAt: t.createdAt ?? now,
    updatedAt: t.updatedAt ?? now,
    lastRunAt: t.lastRunAt,
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(full));
};

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRouteParams();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// A small harness that renders SaveModal plus a live count of the store.
const StoreProbe = () => {
  const { timers } = useSavedTimers();
  return <Text testID="count">{timers.length}</Text>;
};
const SaveHarness = ({
  mode = 'tabata',
  config = { rounds: 8, work: 30, rest: 10 } as SavedTimer['config'],
  existingId = null,
  onSaved = jest.fn(),
}: {
  mode?: SavedTimer['mode'];
  config?: SavedTimer['config'];
  existingId?: string | null;
  onSaved?: (r: SavedTimer) => void;
}) => (
  <>
    <StoreProbe />
    <SaveModal
      visible
      mode={mode}
      config={config}
      defaultName=""
      existingId={existingId}
      onClose={jest.fn()}
      onSaved={onSaved}
    />
  </>
);

describe('SAVE — new timer via SaveModal', () => {
  it('names + saves a new timer into the unified store', async () => {
    const onSaved = jest.fn();
    renderWithProviders(<SaveHarness mode="tabata" config={{ rounds: 5, work: 20, rest: 5 }} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(0));

    fireEvent.changeText(screen.getByPlaceholderText('e.g. Wednesday strength'), 'Cindy');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    const rec = onSaved.mock.calls[0][0] as SavedTimer;
    expect(rec).toMatchObject({ name: 'Cindy', mode: 'tabata', config: { rounds: 5, work: 20, rest: 5 } });
    expect(screen.getByTestId('count').props.children).toBe(1);

    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Cindy');
  });
});

describe('SAVE — overwrite on name collision', () => {
  it('prompts to replace and updates in place (no duplicate)', async () => {
    await seed([{ id: 'fran', name: 'Fran', mode: 'tabata', config: { rounds: 8, work: 30, rest: 10 } }]);
    // auto-confirm the "Replace" button in the Alert.
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons: any) => {
      buttons?.find((b: any) => b.text === 'Replace')?.onPress?.();
    });

    const onSaved = jest.fn();
    // existingId=null so the collision path (by name) is taken, not the id path.
    renderWithProviders(<SaveHarness mode="tabata" config={{ rounds: 21, work: 45, rest: 15 }} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(1));

    fireEvent.changeText(screen.getByPlaceholderText('e.g. Wednesday strength'), 'Fran');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(alertSpy).toHaveBeenCalled();
    // still one record — replaced, not appended
    expect(screen.getByTestId('count').props.children).toBe(1);
    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('fran'); // same record id
    expect((stored[0].config as TabataConfig).rounds).toBe(21); // updated config
  });
});

describe('LOAD — Saved list routes into the right mode with savedId', () => {
  it('tapping a Tabata card pushes /tabata with the saved id', async () => {
    await seed([{ id: 'abc', name: 'Wednesday strength', mode: 'tabata' }]);
    renderWithProviders(<Saved />);
    const card = await screen.findByText('Wednesday strength');
    fireEvent.press(card);
    expect(router().push).toHaveBeenCalledWith({
      pathname: '/tabata',
      params: { savedId: 'abc' },
    });
  });

  it('remaps the fortime mode to the /for-time route', async () => {
    await seed([{ id: 'ft1', name: 'Grace', mode: 'fortime', config: { duration: 20 } }]);
    renderWithProviders(<Saved />);
    const card = await screen.findByText('Grace');
    fireEvent.press(card);
    expect(router().push).toHaveBeenCalledWith({
      pathname: '/for-time',
      params: { savedId: 'ft1' },
    });
  });

  it('search filters the list by name', async () => {
    await seed([
      { id: 'a', name: 'Murph', mode: 'complex', config: [] },
      { id: 'b', name: 'Cindy', mode: 'tabata' },
    ]);
    renderWithProviders(<Saved />);
    await screen.findByText('Murph');
    fireEvent.changeText(screen.getByPlaceholderText('Search saved timers…'), 'cin');
    await waitFor(() => expect(screen.queryByText('Murph')).toBeNull());
    expect(screen.getByText('Cindy')).toBeTruthy();
  });
});

describe('PREFILL + markRun — loading a saved config into a mode', () => {
  it('prefills the Tabata setup from savedId and stamps lastRunAt on START', async () => {
    await seed([{ id: 'load1', name: 'Loaded', mode: 'tabata', config: { rounds: 12, work: 45, rest: 15 } }]);
    setRouteParams({ savedId: 'load1' });

    renderWithProviders(<Tabata />);

    // fields prefill from the saved config (distinct values)
    await waitFor(() => expect(screen.getByDisplayValue('12')).toBeTruthy());
    expect(screen.getByDisplayValue('45')).toBeTruthy();
    expect(screen.getByDisplayValue('15')).toBeTruthy();

    // START marks the loaded timer as run (recent-first ordering)
    await act(async () => {
      fireEvent.press(screen.getByText('START'));
    });
    await waitFor(async () => {
      const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!);
      expect(stored[0].lastRunAt).toBeGreaterThan(0);
    });
  });
});
