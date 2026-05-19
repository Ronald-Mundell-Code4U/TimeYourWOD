import React, { useEffect, useRef, useState } from 'react';
import { useTimerFontSize } from '../hooks/useTimerFontSize';
import { TimerDisplay } from '../components/TimerDisplay';
import { ButtonCMD } from '../components/ButtonCMD';
import { formatStopwatch } from '../lib/timer-utils';

type Mode = 'clock' | 'stopwatch';

const Clock: React.FC = () => {
  const [mode, setMode] = useState<Mode>('clock');
  const [now, setNow] = useState(new Date());

  // stopwatch state
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  const fontSize = useTimerFontSize({ heatsEnabled: false });

  // wall clock tick — only when needed
  useEffect(() => {
    if (mode !== 'clock') return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  // stopwatch tick — ~30Hz so centiseconds read smoothly
  useEffect(() => {
    if (mode !== 'stopwatch' || !running || paused) return;
    startRef.current = performance.now() - elapsedMs;
    const id = setInterval(() => {
      setElapsedMs(performance.now() - startRef.current);
    }, 33);
    return () => clearInterval(id);
    // intentionally don't depend on elapsedMs — the ref captures the offset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, paused]);

  const clockTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const display = mode === 'clock' ? clockTime : formatStopwatch(elapsedMs);
  const label = mode === 'clock' ? 'WALL CLOCK' : 'STOPWATCH';

  const reset = () => {
    setRunning(false);
    setPaused(false);
    setElapsedMs(0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        paddingTop: 'calc(48px + var(--safe-t))',
        paddingBottom: 'var(--safe-b)',
        paddingLeft: 'var(--safe-l)',
        paddingRight: 'var(--safe-r)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <TimerDisplay time={display} fontSize={fontSize} label={label} />
      </div>

      <div
        style={{
          padding: '1rem 1rem calc(1rem + var(--safe-b))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {/* Action row — ALWAYS rendered with reserved height so toggling
            modes doesn't shift the CLOCK / STOPWATCH chips below. */}
        <div
          style={{
            minHeight: 48,
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {mode === 'stopwatch' &&
            (!running ? (
              <ButtonCMD text="START" onPress={() => setRunning(true)} />
            ) : (
              <>
                <ButtonCMD
                  text={paused ? 'RESUME' : 'PAUSE'}
                  onPress={() => setPaused((p) => !p)}
                />
                {/* Same primary variant as PAUSE/RESUME so all three live
                    stopwatch actions share dimensions (140 min-width × 48 min-height). */}
                <ButtonCMD text="RESET" onPress={reset} />
              </>
            ))}
        </div>

        {/* Mode toggle — sits below the action row, fixed position */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMode('clock');
              reset();
            }}
            style={{
              borderColor: mode === 'clock' ? 'var(--fg)' : 'var(--line)',
              color: mode === 'clock' ? 'var(--fg)' : 'var(--fg-dim)',
            }}
          >
            CLOCK
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setMode('stopwatch')}
            style={{
              borderColor: mode === 'stopwatch' ? 'var(--fg)' : 'var(--line)',
              color: mode === 'stopwatch' ? 'var(--fg)' : 'var(--fg-dim)',
            }}
          >
            STOPWATCH
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock;
