import { buildTimeline, timelineTotal, type Seg } from '../complex-timeline';
import type { Loop, Workout } from '../types';

const loop = (over: Partial<Loop> & { intervals: Loop['intervals'] }): Loop => ({
  id: 'l',
  rounds: 1,
  transitionRest: 0,
  ...over,
});

describe('buildTimeline', () => {
  it('emits a WORK then REST segment per interval', () => {
    const workout: Workout = [
      loop({ intervals: [{ id: 'i1', label: 'Row', work: 30, rest: 10 }] }),
    ];
    const segs = buildTimeline(workout);
    expect(segs.map((s) => [s.phase, s.duration, s.label])).toEqual([
      ['WORK', 30, 'Row'],
      ['REST', 10, ''],
    ]);
  });

  it('repeats intervals for each round with a 1-based round index', () => {
    const workout: Workout = [
      loop({ rounds: 3, intervals: [{ id: 'i1', label: '', work: 20, rest: 0 }] }),
    ];
    const segs = buildTimeline(workout);
    expect(segs).toHaveLength(3);
    expect(segs.map((s) => s.round)).toEqual([1, 2, 3]);
    expect(segs.every((s) => s.loopRounds === 3)).toBe(true);
  });

  it('skips zero-duration work or rest', () => {
    const workout: Workout = [
      loop({ intervals: [{ id: 'i1', label: 'x', work: 40, rest: 0 }] }),
    ];
    const segs = buildTimeline(workout);
    expect(segs).toHaveLength(1);
    expect(segs[0].phase).toBe('WORK');
  });

  it('appends a TRANSITION rest after a loop but NOT after the last loop', () => {
    const workout: Workout = [
      loop({ intervals: [{ id: 'a', label: '', work: 10, rest: 0 }], transitionRest: 15 }),
      loop({ intervals: [{ id: 'b', label: '', work: 10, rest: 0 }], transitionRest: 15 }),
    ];
    const segs = buildTimeline(workout);
    const transitions = segs.filter((s) => s.isTransition);
    expect(transitions).toHaveLength(1);
    expect(transitions[0]).toMatchObject({ phase: 'REST', duration: 15, label: 'TRANSITION', loop: 1 });
  });

  it('numbers loops 1-based across multiple loops', () => {
    const workout: Workout = [
      loop({ intervals: [{ id: 'a', label: '', work: 10, rest: 0 }] }),
      loop({ intervals: [{ id: 'b', label: '', work: 10, rest: 0 }] }),
    ];
    const segs = buildTimeline(workout);
    expect(segs.map((s) => s.loop)).toEqual([1, 2]);
  });

  it('returns an empty timeline for an empty workout', () => {
    expect(buildTimeline([])).toEqual([]);
  });
});

describe('timelineTotal', () => {
  it('sums all segment durations', () => {
    const segs: Seg[] = buildTimeline([
      loop({ rounds: 2, intervals: [{ id: 'i', label: '', work: 30, rest: 10 }], transitionRest: 0 }),
    ]);
    // 2 rounds * (30 + 10) = 80
    expect(timelineTotal(segs)).toBe(80);
  });

  it('is 0 for an empty timeline', () => {
    expect(timelineTotal([])).toBe(0);
  });
});
