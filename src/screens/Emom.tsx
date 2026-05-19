import React, { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { ButtonCMD } from '../components/ButtonCMD';
import { SetupShell } from '../components/SetupShell';
import { TimerScreen } from '../components/TimerScreen';
import { FieldRow } from '../components/FieldRow';
import { useTimerFontSize } from '../hooks/useTimerFontSize';
import { useMonotonicElapsed } from '../hooks/useMonotonicElapsed';
import { useWakeLock } from '../hooks/useWakeLock';
import { COUNTDOWN_TIME, formatMMSS, formatTimeFromNow, playSafe } from '../lib/timer-utils';

const Emom: React.FC = () => {
  const { settings, audio, unlockAudio } = useSettings();
  const fontSize = useTimerFontSize({ heatsEnabled: settings.heatsEnable });

  // work seconds per round + rest between rounds
  const [workTotal, setWorkTotal] = useState(60);
  const [rest, setRest] = useState(0); // seconds between rounds
  const [rounds, setRounds] = useState(10);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const beepFiredRef = useRef<Set<string>>(new Set());

  const { elapsed, reset: resetElapsed } = useMonotonicElapsed(
    running && !paused && !ended
  );

  useWakeLock(running && !paused && !ended);

  const cycle = workTotal + rest;
  const totalSeconds = cycle * rounds - (rest > 0 ? rest : 0); // last round doesn't need rest after

  type HeatState = {
    display: string;
    round: number;
    phase: 'WORK' | 'REST' | null;
    beep: string | null;
    finished: boolean;
  };

  const computeHeat = (offset: number): HeatState => {
    const rel = elapsed - offset;
    if (rel < 0) {
      const untilGo = COUNTDOWN_TIME - rel;
      return { display: formatMMSS(untilGo), round: 0, phase: null, beep: null, finished: false };
    }
    if (rel < COUNTDOWN_TIME) {
      const remaining = COUNTDOWN_TIME - rel;
      return {
        display: String(remaining),
        round: 0,
        phase: null,
        beep:
          remaining === 3 ? 'b1' : remaining === 2 ? 'b2' : remaining === 1 ? 'b3' : remaining === 0 ? 'final' : null,
        finished: false,
      };
    }
    const t = rel - COUNTDOWN_TIME;
    if (t >= totalSeconds) {
      return { display: '00:00', round: rounds, phase: null, beep: t === totalSeconds ? 'final' : null, finished: true };
    }
    const round = Math.floor(t / cycle) + 1;
    const inCycle = t % cycle;
    const inWork = inCycle < workTotal;
    const remaining = inWork ? workTotal - inCycle : cycle - inCycle;
    let beep: string | null = null;
    if (remaining === 3) beep = 'b1';
    else if (remaining === 2) beep = 'b2';
    else if (remaining === 1) beep = 'b3';
    else if (inCycle === 0 && t > 0) beep = 'final'; // start of each round
    return {
      display: formatMMSS(remaining),
      round,
      phase: inWork ? 'WORK' : 'REST',
      beep,
      finished: false,
    };
  };

  const heat1 = computeHeat(0);
  const heat2 = settings.heatsEnable ? computeHeat(settings.heatsDelay) : null;

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
    resetElapsed();
    beepFiredRef.current.clear();
  };

  const start = () => {
    if (!workTotal || !rounds) return;
    unlockAudio();
    beepFiredRef.current.clear();
    resetElapsed();
    setRunning(true);
  };

  const progress = (() => {
    const rel = elapsed - COUNTDOWN_TIME;
    if (rel <= 0) return 0;
    return Math.min(1, rel / totalSeconds);
  })();

  const h1End = COUNTDOWN_TIME + totalSeconds - elapsed;
  const h2End = settings.heatsDelay + COUNTDOWN_TIME + totalSeconds - elapsed;

  if (!running) {
    return (
      <SetupShell title="EMOM">
        <div className="form-stack">
          <FieldRow prefix="FOR" suffix="ROUNDS" value={rounds} onChange={setRounds} min={1} />
          <FieldRow prefix="EVERY" suffix="SECONDS" value={workTotal} onChange={setWorkTotal} min={1} />
          <FieldRow prefix="REST" suffix="SECONDS" value={rest} onChange={setRest} min={0} />
          <button
            type="button"
            className="form-stack__action"
            onClick={start}
            disabled={!workTotal || !rounds}
          >
            START
          </button>
        </div>
        <div className="total-line">
          Total <span className="total-line__value">{formatMMSS(totalSeconds)}</span>
        </div>
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
          round={heat1.round}
          showRound={elapsed >= COUNTDOWN_TIME}
          fontSize={fontSize}
          phase={heat1.phase}
          label={settings.heatsEnable ? 'HEAT 1' : 'EMOM'}
        />
      }
      heat2={
        heat2 ? (
          <TimerDisplay
            time={heat2.display}
            round={heat2.round}
            showRound={elapsed >= settings.heatsDelay + COUNTDOWN_TIME}
            fontSize={fontSize}
            phase={heat2.phase}
            label="HEAT 2"
          />
        ) : null
      }
      belowTimer={
        ended ? (
          <>
            <div className="status-text">{rounds} ROUNDS · COMPLETE</div>
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
            <span>HEAT 1 ENDS · {formatTimeFromNow(h1End)}</span>
            <span>HEAT 2 ENDS · {formatTimeFromNow(h2End)}</span>
          </div>
        ) : (
          <div className="status-text">WORKOUT ENDS · {formatTimeFromNow(h1End)}</div>
        )
      }
    />
  );
};

export default Emom;
