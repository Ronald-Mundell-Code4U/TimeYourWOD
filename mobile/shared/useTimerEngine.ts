import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../contexts/SettingsContext';
import type { BeepKind } from './timer-utils';

/**
 * Drives an integer-seconds elapsed counter from a *monotonic clock*
 * (performance.now()) instead of cumulative setInterval ticks.
 *
 * Why this matters:
 *  • setInterval on RN can drift on slower devices or under JS-thread
 *    load — each missed tick used to lose a full second, and the displayed
 *    clock fell behind real time as a workout wore on.
 *  • When the app returns from background (or focus is restored), queued
 *    interval callbacks used to fire back-to-back, which triggered the
 *    beep-dedup ring multiple times in quick succession ("3 beeps rapidly").
 *  • Here, `elapsed = floor((now - start) / 1000)` is recomputed each rAF
 *    callback. A delayed rAF just updates elapsed to its CURRENT correct
 *    value in one state change — the beep dedup ring fires at most once.
 *
 * Mode screens compute heat 1 / heat 2 state from `elapsed`, then pass the
 * resulting `beep` kinds back here to fire audio + haptics exactly once.
 */
export function useTimerEngine() {
  const { audio } = useSettings();
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const beepFiredRef = useRef<Set<string>>(new Set());

  // monotonic-clock state
  const clock = useRef({ startTime: 0, accum: 0 });
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  const active = running && !paused && !ended;

  // edges of `active` — start/resume records anchor, pause/stop folds into accum.
  useEffect(() => {
    if (active) {
      clock.current.startTime = performance.now();
    } else if (clock.current.startTime > 0) {
      clock.current.accum += performance.now() - clock.current.startTime;
      clock.current.startTime = 0;
    }
  }, [active]);

  // tick at frame rate while active; only re-render when the second changes.
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const total =
        clock.current.accum +
        (clock.current.startTime > 0 ? performance.now() - clock.current.startTime : 0);
      const sec = Math.floor(total / 1000);
      if (sec !== elapsedRef.current) setElapsed(sec);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const fireBeep = (key: string, beep: BeepKind) => {
    if (!beep) return;
    const k = `${key}:${elapsed}:${beep}`;
    if (beepFiredRef.current.has(k)) return;
    beepFiredRef.current.add(k);
    audio.play(beep);
    // matched-strength haptics — light tick on 3-2-1, heavier on GO
    if (beep === 'final') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const zeroClock = () => {
    clock.current.startTime = 0;
    clock.current.accum = 0;
  };

  const start = () => {
    zeroClock();
    setElapsed(0);
    beepFiredRef.current.clear();
    setRunning(true);
    setPaused(false);
    setEnded(false);
  };
  const reset = () => {
    setRunning(false);
    setPaused(false);
    setEnded(false);
    zeroClock();
    setElapsed(0);
    beepFiredRef.current.clear();
  };
  const togglePause = () => setPaused((p) => !p);
  const markEnded = () => setEnded(true);

  return {
    running,
    paused,
    ended,
    elapsed,
    start,
    reset,
    togglePause,
    markEnded,
    fireBeep,
  };
}
