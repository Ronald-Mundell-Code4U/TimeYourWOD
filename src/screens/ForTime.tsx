import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { ButtonCMD } from '../components/ButtonCMD';
import { SetupShell } from '../components/SetupShell';
import { TimerScreen } from '../components/TimerScreen';
import { FieldRow } from '../components/FieldRow';
import { useTimerFontSize } from '../hooks/useTimerFontSize';
import { useWakeLock } from '../hooks/useWakeLock';
import {
  COUNTDOWN_TIME,
  formatMMSS,
  formatTimeFromNow,
  playSafe,
} from '../lib/timer-utils';

const ForTime: React.FC = () => {
  const { settings, audio, unlockAudio } = useSettings();
  const fontSize = useTimerFontSize({ heatsEnabled: settings.heatsEnable });

  const [duration, setDuration] = useState<number>(10); // minutes
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds since START
  const beepFiredRef = useRef<Set<string>>(new Set());

  useWakeLock(running && !paused && !ended);

  // 1Hz tick
  useEffect(() => {
    if (!running || paused || ended) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, paused, ended]);

  const baseSeconds = duration * 60;
  const overtimeSeconds = settings.fortime;
  const totalSeconds = baseSeconds + overtimeSeconds;

  // Build heat data
  type HeatState = {
    display: string;
    overtime: boolean;
    active: boolean;
    beep: string | null;
    finished: boolean;
  };

  const computeHeat = (offset: number): HeatState => {
    const rel = elapsed - offset;
    if (rel < 0) {
      const untilGo = COUNTDOWN_TIME - rel;
      return { display: formatMMSS(untilGo), overtime: false, active: false, beep: null, finished: false };
    }
    if (rel < COUNTDOWN_TIME) {
      const remaining = COUNTDOWN_TIME - rel;
      return {
        display: String(remaining),
        overtime: false,
        active: true,
        beep:
          remaining === 3 ? 'b1' : remaining === 2 ? 'b2' : remaining === 1 ? 'b3' : remaining === 0 ? 'final' : null,
        finished: false,
      };
    }
    const t = rel - COUNTDOWN_TIME; // seconds since go
    if (t >= 0 && t < totalSeconds) {
      const remainingTotal = totalSeconds - t;
      const overtimeActive = t >= baseSeconds;
      // beeps at start, end of base, and end of overtime
      let beep: string | null = null;
      if (t === 0) beep = 'final'; // GO
      else if (t === baseSeconds - 3 || t === totalSeconds - 3) beep = 'b1';
      else if (t === baseSeconds - 2 || t === totalSeconds - 2) beep = 'b2';
      else if (t === baseSeconds - 1 || t === totalSeconds - 1) beep = 'b3';
      else if (t === baseSeconds && overtimeSeconds > 0) beep = 'final';
      const showSeconds = overtimeActive ? t - baseSeconds : remainingTotal - overtimeSeconds;
      return {
        display: formatMMSS(showSeconds),
        overtime: overtimeActive,
        active: true,
        beep,
        finished: false,
      };
    }
    return {
      display: '00:00',
      overtime: false,
      active: false,
      beep: t === totalSeconds ? 'final' : null,
      finished: true,
    };
  };

  const heat1 = computeHeat(0);
  const heat2 = settings.heatsEnable ? computeHeat(settings.heatsDelay) : null;

  // play beeps once per (heat, key) tuple
  useEffect(() => {
    const playFor = (key: string, beep: string | null) => {
      if (!beep) return;
      const k = `${key}:${elapsed}:${beep}`;
      if (beepFiredRef.current.has(k)) return;
      beepFiredRef.current.add(k);
      if (beep === 'b1') playSafe(audio.beep1);
      else if (beep === 'b2') playSafe(audio.beep2);
      else if (beep === 'b3') playSafe(audio.beep3);
      else if (beep === 'final') playSafe(audio.finalBeep);
    };
    playFor('h1', heat1.beep);
    if (heat2) playFor('h2', heat2.beep);
  }, [elapsed, heat1.beep, heat2?.beep, audio]);

  // detect end-of-workout
  useEffect(() => {
    if (!running || ended) return;
    const h1Done = heat1.finished;
    const h2Done = !settings.heatsEnable || (heat2?.finished ?? false);
    if (h1Done && h2Done) setEnded(true);
  }, [heat1.finished, heat2?.finished, settings.heatsEnable, running, ended]);

  const reset = () => {
    setRunning(false);
    setPaused(false);
    setEnded(false);
    setElapsed(0);
    beepFiredRef.current.clear();
  };

  const start = () => {
    if (!duration) return;
    unlockAudio();
    beepFiredRef.current.clear();
    setRunning(true);
  };

  // progress for the rail (0..1 across base time of heat 1 active phase)
  const progress = (() => {
    const rel = elapsed - COUNTDOWN_TIME;
    if (rel <= 0) return 0;
    return Math.min(1, rel / totalSeconds);
  })();

  // end-time projections
  const heat1EndOffset = COUNTDOWN_TIME + totalSeconds - elapsed;
  const heat2EndOffset = settings.heatsDelay + COUNTDOWN_TIME + totalSeconds - elapsed;

  if (!running) {
    return (
      <SetupShell title="FOR TIME">
        <div className="form-stack">
          <FieldRow prefix="FOR" suffix="MINUTES" value={duration} onChange={setDuration} min={1} />
          <button
            type="button"
            className="form-stack__action"
            onClick={start}
            disabled={!duration}
          >
            START
          </button>
        </div>
        {overtimeSeconds > 0 && (
          <div className="total-line">
            Overtime <span className="total-line__value">{formatMMSS(overtimeSeconds)}</span>
          </div>
        )}
      </SetupShell>
    );
  }

  return (
    <TimerScreen
      progress={progress}
      paused={paused}
      running
      onTogglePause={() => !ended && setPaused((p) => !p)}
      onReset={reset}
      heat1={
        <TimerDisplay
          time={heat1.display}
          fontSize={fontSize}
          overtime={heat1.overtime}
          label={settings.heatsEnable ? 'HEAT 1' : 'FOR TIME'}
        />
      }
      heat2={
        heat2 ? (
          <TimerDisplay
            time={heat2.display}
            fontSize={fontSize}
            overtime={heat2.overtime}
            label="HEAT 2"
          />
        ) : null
      }
      belowTimer={
        ended ? (
          <>
            <div className="status-text">{duration} MIN · COMPLETE</div>
            <ButtonCMD text="RESTART" onPress={reset} />
          </>
        ) : settings.heatsEnable ? (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--fg-dim)',
            }}
          >
            <span>HEAT 1 ENDS · {formatTimeFromNow(heat1EndOffset)}</span>
            <span>HEAT 2 ENDS · {formatTimeFromNow(heat2EndOffset)}</span>
          </div>
        ) : (
          <div className="status-text">WORKOUT ENDS · {formatTimeFromNow(heat1EndOffset)}</div>
        )
      }
    />
  );
};

export default ForTime;
