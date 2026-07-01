import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, flushHydration, clearRouteParams } from '../../test-utils';

import Home from '../(tabs)/index';
import Saved from '../(tabs)/saved';
import About from '../(tabs)/about';
import Settings from '../settings';
import Clock from '../clock';
import Tabata from '../tabata';
import ForTime from '../for-time';
import Amrap from '../amrap';
import Emom from '../emom';
import Complex from '../complex';

beforeEach(() => clearRouteParams());

describe('Home (Timers tab)', () => {
  it('renders all six mode buttons', async () => {
    renderWithProviders(<Home />);
    await flushHydration();
    for (const label of ['CLOCK', 'TABATA', 'FOR TIME', 'EMOM', 'AMRAP', 'COMPLEX']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });
});

describe('mode setup screens render their config + START', () => {
  it('Tabata: FOR/WORK/REST rows + START', async () => {
    renderWithProviders(<Tabata />);
    await flushHydration();
    expect(screen.getByText('FOR')).toBeTruthy();
    expect(screen.getByText('WORK')).toBeTruthy();
    expect(screen.getAllByText('REST').length).toBeGreaterThan(0);
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('For Time: FOR / MINUTES + START', async () => {
    renderWithProviders(<ForTime />);
    await flushHydration();
    expect(screen.getByText('MINUTES')).toBeTruthy();
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('AMRAP: FOR / MINUTES + START', async () => {
    renderWithProviders(<Amrap />);
    await flushHydration();
    expect(screen.getByText('MINUTES')).toBeTruthy();
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('EMOM: EVERY / SECONDS + START', async () => {
    renderWithProviders(<Emom />);
    await flushHydration();
    expect(screen.getByText('EVERY')).toBeTruthy();
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('Complex: builder renders START', async () => {
    renderWithProviders(<Complex />);
    await flushHydration();
    expect(screen.getByText('START')).toBeTruthy();
  });

  it('Clock: shows CLOCK/STOPWATCH toggle; STOPWATCH reveals START', async () => {
    renderWithProviders(<Clock />);
    await flushHydration();
    expect(screen.getByText('CLOCK')).toBeTruthy();
    expect(screen.getByText('STOPWATCH')).toBeTruthy();
    // wall-clock mode has no START; switching to stopwatch reveals it
    expect(screen.queryByText('START')).toBeNull();
    fireEvent.press(screen.getByText('STOPWATCH'));
    expect(screen.getByText('START')).toBeTruthy();
  });
});

describe('utility screens', () => {
  it('Settings: title + each settings group', async () => {
    renderWithProviders(<Settings />);
    await flushHydration();
    expect(screen.getByText('SETTINGS')).toBeTruthy();
    expect(screen.getByText('Theme')).toBeTruthy();
    expect(screen.getByText('Heats')).toBeTruthy();
    expect(screen.getByText('Beep pack')).toBeTruthy();
  });

  it('Saved: renders the search bar (empty state)', async () => {
    renderWithProviders(<Saved />);
    await flushHydration();
    expect(screen.getByPlaceholderText('Search saved timers…')).toBeTruthy();
  });

  it('About: renders heading + Ko-fi CTA', async () => {
    renderWithProviders(<About />);
    await flushHydration();
    expect(screen.getByText('ABOUT US')).toBeTruthy();
    expect(screen.getByText('Support on Ko-fi')).toBeTruthy();
  });
});
