import React, { type ReactElement, type ReactNode } from 'react';
import { render, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from './contexts/SettingsContext';
import { SavedTimersProvider } from './contexts/SavedTimersContext';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export const AllProviders = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider initialMetrics={initialMetrics}>
    <SettingsProvider>
      <SavedTimersProvider>{children}</SavedTimersProvider>
    </SettingsProvider>
  </SafeAreaProvider>
);

/** Render a screen/component inside the app's real providers + safe-area metrics. */
export const renderWithProviders = (ui: ReactElement) =>
  render(ui, { wrapper: AllProviders });

/**
 * Flush the providers' async AsyncStorage hydration inside act(). Call right
 * after a synchronous render whose assertions don't otherwise await state
 * (waitFor/findBy already flush, so those don't need this).
 */
export const flushHydration = () =>
  act(async () => {
    await new Promise((resolve) => setImmediate(resolve));
  });

/** Inject route params that the mocked useLocalSearchParams will return. */
export const setRouteParams = (params: Record<string, unknown>) => {
  (global as any).__ROUTER_PARAMS__ = params;
};
export const clearRouteParams = () => {
  (global as any).__ROUTER_PARAMS__ = {};
};
