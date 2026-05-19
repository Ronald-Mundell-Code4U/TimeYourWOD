// Shared cross-mode types. Mirrors the web's data shapes so logic can be ported verbatim.

export type Mode = 'clock' | 'tabata' | 'fortime' | 'amrap' | 'emom' | 'complex';

export interface Interval {
  id: string;
  label: string;
  work: number;
  rest: number;
}

export interface Loop {
  id: string;
  rounds: number;
  intervals: Interval[];
  transitionRest: number;
}

export type Workout = Loop[];

export interface TabataConfig {
  rounds: number;
  work: number;
  rest: number;
}

export interface EmomConfig {
  rounds: number;
  workTotal: number;
  rest: number;
}

export interface AmrapConfig {
  duration: number; // minutes
}

export interface ForTimeConfig {
  duration: number; // minutes
}

export type ModeConfig =
  | { mode: 'tabata'; config: TabataConfig }
  | { mode: 'emom'; config: EmomConfig }
  | { mode: 'amrap'; config: AmrapConfig }
  | { mode: 'fortime'; config: ForTimeConfig }
  | { mode: 'complex'; config: Workout };

export interface SavedTimer {
  id: string;
  name: string;
  mode: Exclude<Mode, 'clock'>;
  config: TabataConfig | EmomConfig | AmrapConfig | ForTimeConfig | Workout;
  createdAt: number;
  updatedAt: number;
  lastRunAt?: number;
}

export const newId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const newInterval = (): Interval => ({
  id: newId(),
  label: '',
  work: 30,
  rest: 10,
});

export const newLoop = (): Loop => ({
  id: newId(),
  rounds: 1,
  intervals: [newInterval()],
  transitionRest: 0,
});
