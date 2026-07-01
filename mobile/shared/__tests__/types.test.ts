import {
  newId,
  newInterval,
  newLoop,
  type ModeConfig,
  type SavedTimer,
  type TabataConfig,
  type EmomConfig,
  type AmrapConfig,
  type ForTimeConfig,
  type Workout,
} from '../types';

/* ---------- compile-time (type-level) assertions ----------
 * These don't run assertions at runtime — they fail the build (tsc / ts-jest
 * transform) if the discriminated unions ever drift. `npm run typecheck` and
 * the jest transform both enforce them.
 */

// Valid mode/config pairings must satisfy ModeConfig.
const _tabata: ModeConfig = { mode: 'tabata', config: { rounds: 8, work: 30, rest: 10 } };
const _emom: ModeConfig = { mode: 'emom', config: { rounds: 10, workTotal: 60, rest: 0 } };
const _amrap: ModeConfig = { mode: 'amrap', config: { duration: 12 } };
const _fortime: ModeConfig = { mode: 'fortime', config: { duration: 20 } };
const _complex: ModeConfig = { mode: 'complex', config: [] as Workout };
void [_tabata, _emom, _amrap, _fortime, _complex];

// @ts-expect-error — a tabata mode cannot carry an amrap config.
const _mismatch: ModeConfig = { mode: 'tabata', config: { duration: 12 } };
void _mismatch;

// @ts-expect-error — 'clock' is not a savable mode (SavedTimer excludes it).
const _clockSaved: SavedTimer['mode'] = 'clock';
void _clockSaved;

// Per-mode config shapes are distinct.
const _t: TabataConfig = { rounds: 1, work: 1, rest: 1 };
const _e: EmomConfig = { rounds: 1, workTotal: 1, rest: 1 };
const _a: AmrapConfig = { duration: 1 };
const _f: ForTimeConfig = { duration: 1 };
void [_t, _e, _a, _f];

describe('newId', () => {
  it('produces a non-empty string', () => {
    expect(typeof newId()).toBe('string');
    expect(newId().length).toBeGreaterThan(4);
  });
  it('produces unique ids across calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId()));
    expect(ids.size).toBe(200);
  });
});

describe('newInterval', () => {
  it('defaults to 30s work / 10s rest with a fresh id and empty label', () => {
    const iv = newInterval();
    expect(iv).toMatchObject({ label: '', work: 30, rest: 10 });
    expect(iv.id).toBeTruthy();
  });
});

describe('newLoop', () => {
  it('starts with one interval, one round, no transition rest', () => {
    const l = newLoop();
    expect(l.rounds).toBe(1);
    expect(l.transitionRest).toBe(0);
    expect(l.intervals).toHaveLength(1);
    expect(l.id).toBeTruthy();
  });
});
