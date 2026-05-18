import { useEffect, useRef } from 'react';

type WakeLockSentinel = { release: () => Promise<void> } & EventTarget;

type WakeLockApi = { request: (type: 'screen') => Promise<WakeLockSentinel> };

export const useWakeLock = (active: boolean) => {
  const ref = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: WakeLockApi };
    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        ref.current = sentinel;
      } catch {
        /* permission denied or not supported */
      }
    };

    const release = () => {
      const s = ref.current;
      ref.current = null;
      if (s) s.release().catch(() => {});
    };

    if (active) {
      acquire();
      // re-acquire on visibility restore
      const onVis = () => {
        if (document.visibilityState === 'visible' && active && !ref.current) acquire();
      };
      document.addEventListener('visibilitychange', onVis);
      return () => {
        cancelled = true;
        document.removeEventListener('visibilitychange', onVis);
        release();
      };
    } else {
      release();
    }
    return undefined;
  }, [active]);
};
