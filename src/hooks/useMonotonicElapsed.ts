import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a monotonically-counting "seconds elapsed" value backed by
 * performance.now() rather than setInterval ticks. Three properties over a
 * naive setInterval(..., 1000):
 *
 *  1. No drift — the displayed second is `Math.floor((now - start) / 1000)`,
 *     so missing one rAF callback does not desync the count.
 *  2. No "burst" callbacks — when a backgrounded tab returns to focus,
 *     setInterval can fire many queued callbacks back-to-back, which would
 *     trigger several beeps in rapid succession. Here `elapsed` just jumps
 *     to its current correct value in one state update, so the beep dedup
 *     ring fires at most once.
 *  3. Pause/resume correctness — accumulated active-time is carried across
 *     pauses, so resuming continues at the exact integer second it stopped.
 *
 * `active` should be `running && !paused && !ended` — when it flips false the
 * elapsed time freezes; when it flips true the clock picks up where it left off.
 *
 * Call `reset()` to zero everything (after a workout completes, on RESTART, etc).
 */
export function useMonotonicElapsed(active: boolean): {
  elapsed: number;
  reset: () => void;
} {
  const [elapsed, setElapsed] = useState(0);
  const clock = useRef({ startTime: 0, accum: 0 });
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  // edges of `active` — fold any in-flight running interval into accum on pause.
  useEffect(() => {
    if (active) {
      clock.current.startTime = performance.now();
    } else if (clock.current.startTime > 0) {
      clock.current.accum += performance.now() - clock.current.startTime;
      clock.current.startTime = 0;
    }
  }, [active]);

  // tick at frame rate; only re-render when the integer second changes.
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

  const reset = useCallback(() => {
    clock.current.startTime = 0;
    clock.current.accum = 0;
    setElapsed(0);
  }, []);

  return { elapsed, reset };
}
