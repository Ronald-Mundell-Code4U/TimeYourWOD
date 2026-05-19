// Ported verbatim from web src/lib/timer-utils.ts (minus the web-only playSafe).
// Pure functions — safe to share between web and native if/when extracted to a workspace pkg.

export const COUNTDOWN_TIME = 10;

export const pad = (n: number): string =>
  String(Math.max(0, Math.floor(n))).padStart(2, '0');

export const formatMMSS = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

export const formatHHMMSS = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

/** Stopwatch readout — MM:SS:CC (centiseconds). 8 characters. */
export const formatStopwatch = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms));
  const cs = Math.floor((total % 1000) / 10);
  const totalSec = Math.floor(total / 1000);
  return `${pad(Math.floor(totalSec / 60))}:${pad(totalSec % 60)}:${pad(cs)}`;
};

export const formatTimeFromNow = (offsetSeconds: number): string => {
  const now = new Date(Date.now() + offsetSeconds * 1000);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/** Map seconds-remaining to which beep should fire at the boundary. */
export type BeepKind = 'b1' | 'b2' | 'b3' | 'final' | null;
export const beepFor = (remaining: number): BeepKind => {
  if (remaining === 3) return 'b1';
  if (remaining === 2) return 'b2';
  if (remaining === 1) return 'b3';
  if (remaining === 0) return 'final';
  return null;
};
