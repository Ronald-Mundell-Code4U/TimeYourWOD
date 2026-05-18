import { useMemo } from 'react';
import { useViewport } from './useViewport';

interface Opts {
  heatsEnabled: boolean;
  minPx?: number;
  maxPx?: number;
  /** width multiplier for single-heat */
  wMul?: number;
  /** height multiplier */
  hMul?: number;
}

export const useTimerFontSize = ({
  heatsEnabled,
  minPx = 80,
  maxPx = 360,
  wMul = 0.22,
  hMul = 0.55,
}: Opts): number => {
  const { width, height, orientation } = useViewport();
  return useMemo(() => {
    // when heats are side-by-side (landscape) or stacked (portrait) we lower one mul.
    let w = wMul;
    let h = hMul;
    if (heatsEnabled) {
      if (orientation === 'landscape') w = wMul * 0.5;
      else h = hMul * 0.5;
    }
    const fromW = width * w;
    const fromH = height * h;
    return Math.max(minPx, Math.min(maxPx, Math.min(fromW, fromH)));
  }, [width, height, orientation, heatsEnabled, minPx, maxPx, wMul, hMul]);
};
