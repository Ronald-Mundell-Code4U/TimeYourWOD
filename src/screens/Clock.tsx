import React, { useEffect, useState } from 'react';
import { useTimerFontSize } from '../hooks/useTimerFontSize';
import { TimerDisplay } from '../components/TimerDisplay';
import { ButtonCMD } from '../components/ButtonCMD';
import { useWakeLock } from '../hooks/useWakeLock';
import { formatHHMMSS } from '../lib/timer-utils';

type Mode = 'clock' | 'stopwatch';

const Clock: React.FC = () => {
  const [mode, setMode] = useState<Mode>('clock');
  const [now, setNow] = useState(new Date());
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const fontSize = useTimerFontSize({ heatsEnabled: false });

  useWakeLock(running && !paused);

  // wall clock tick
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // stopwatch tick
  useEffect(() => {
    if (mode !== 'stopwatch' || !running || paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [mode, running, paused]);

  const clockTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

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
        <TimerDisplay
          time={mode === 'clock' ? clockTime : formatHHMMSS(elapsed)}
          fontSize={fontSize}
          label={mode === 'clock' ? 'WALL CLOCK' : 'STOPWATCH'}
        />
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setMode('clock');
              setRunning(false);
              setPaused(false);
              setElapsed(0);
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

        {mode === 'stopwatch' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!running ? (
              <ButtonCMD text="START" onPress={() => setRunning(true)} />
            ) : (
              <>
                <ButtonCMD text={paused ? 'RESUME' : 'PAUSE'} onPress={() => setPaused((p) => !p)} />
                <ButtonCMD
                  text="RESET"
                  variant="ghost"
                  onPress={() => {
                    setRunning(false);
                    setPaused(false);
                    setElapsed(0);
                  }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
