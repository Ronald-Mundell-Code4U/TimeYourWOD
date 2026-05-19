// Port of the Complex timeline engine from src/screens/Complex.tsx (web).
// Pure logic, no React, no DOM. Reusable from either platform.

import type { Workout } from './types';

export interface Seg {
  phase: 'WORK' | 'REST';
  duration: number;
  loop: number;       // 1-based
  loopRounds: number; // total rounds for that loop
  round: number;      // 1-based within the loop
  label: string;
  isTransition: boolean;
}

export const buildTimeline = (loops: Workout): Seg[] => {
  const segs: Seg[] = [];
  loops.forEach((loop, lIdx) => {
    for (let r = 1; r <= loop.rounds; r++) {
      loop.intervals.forEach((iv) => {
        if (iv.work > 0) {
          segs.push({
            phase: 'WORK',
            duration: iv.work,
            loop: lIdx + 1,
            loopRounds: loop.rounds,
            round: r,
            label: iv.label,
            isTransition: false,
          });
        }
        if (iv.rest > 0) {
          segs.push({
            phase: 'REST',
            duration: iv.rest,
            loop: lIdx + 1,
            loopRounds: loop.rounds,
            round: r,
            label: '',
            isTransition: false,
          });
        }
      });
    }
    if (loop.transitionRest > 0 && lIdx < loops.length - 1) {
      segs.push({
        phase: 'REST',
        duration: loop.transitionRest,
        loop: lIdx + 1,
        loopRounds: loop.rounds,
        round: loop.rounds,
        label: 'TRANSITION',
        isTransition: true,
      });
    }
  });
  return segs;
};

export const timelineTotal = (segs: Seg[]): number =>
  segs.reduce((a, s) => a + s.duration, 0);
