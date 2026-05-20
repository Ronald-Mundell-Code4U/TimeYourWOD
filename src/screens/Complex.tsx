import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerScreen } from '../components/TimerScreen';
import { FieldRow } from '../components/FieldRow';
import { TemplatesPanel } from '../components/TemplatesPanel';
import { ComplexTimeline } from '../components/ComplexTimeline';
import { useTimerFontSize } from '../hooks/useTimerFontSize';
import { useMonotonicElapsed } from '../hooks/useMonotonicElapsed';
import { useViewport } from '../hooks/useViewport';
import { useWakeLock } from '../hooks/useWakeLock';
import { COUNTDOWN_TIME, formatMMSS, formatTimeFromNow, playSafe } from '../lib/timer-utils';

/* ── data model ───────────────────────────────────── */

interface Interval {
  id: string;
  label: string;
  work: number; // seconds
  rest: number; // seconds
}

interface Loop {
  id: string;
  rounds: number;
  intervals: Interval[];
  transitionRest: number; // seconds — appended after this loop if it's not the last one
}

type Workout = Loop[];

const newId = () => Math.random().toString(36).slice(2, 10);
const newInterval = (): Interval => ({ id: newId(), label: '', work: 30, rest: 10 });
const newLoop = (): Loop => ({ id: newId(), rounds: 1, intervals: [newInterval()], transitionRest: 0 });

const COMPLEX_TEMPLATES_KEY = 'complex-templates-v1';

/* ── timeline runtime ─────────────────────────────── */

interface Seg {
  phase: 'WORK' | 'REST';
  duration: number;
  loop: number;       // 1-based
  loopRounds: number; // total rounds for that loop
  round: number;      // 1-based within the loop
  label: string;
  isTransition: boolean;
}

const buildTimeline = (loops: Workout): Seg[] => {
  const segs: Seg[] = [];
  loops.forEach((loop, lIdx) => {
    for (let r = 1; r <= loop.rounds; r++) {
      loop.intervals.forEach((iv) => {
        if (iv.work > 0) {
          segs.push({
            phase: 'WORK',
            duration: iv.work,
            loop: lIdx + 1,
            loopRounds: loop.rounds,
            round: r,
            label: iv.label,
            isTransition: false,
          });
        }
        if (iv.rest > 0) {
          segs.push({
            phase: 'REST',
            duration: iv.rest,
            loop: lIdx + 1,
            loopRounds: loop.rounds,
            round: r,
            label: '',
            isTransition: false,
          });
        }
      });
    }
    if (loop.transitionRest > 0 && lIdx < loops.length - 1) {
      segs.push({
        phase: 'REST',
        duration: loop.transitionRest,
        loop: lIdx + 1,
        loopRounds: loop.rounds,
        round: loop.rounds,
        label: 'TRANSITION',
        isTransition: true,
      });
    }
  });
  return segs;
};

/* ── component ────────────────────────────────────── */

const DRAWER_KEY = 'complex-timeline-drawer-open';

const Complex: React.FC = () => {
  const { settings, audio, unlockAudio } = useSettings();
  const fontSize = useTimerFontSize({ heatsEnabled: settings.heatsEnable });
  const { width } = useViewport();

  const [loops, setLoops] = useState<Workout>([newLoop()]);

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const beepFiredRef = useRef<Set<string>>(new Set());

  const { elapsed, reset: resetElapsed } = useMonotonicElapsed(
    running && !paused && !ended
  );

  // collapsible workout-outline drawer (builder view, wider viewports only)
  // Default OPEN on first visit so new users see the structure right away;
  // remembers the user's last preference after that.
  const [drawerOpen, setDrawerOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DRAWER_KEY);
      if (stored === null) return true;
      return stored === 'true';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(DRAWER_KEY, String(drawerOpen));
    } catch {}
  }, [drawerOpen]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);
  const drawerAvailable = width >= 800; // only render the handle on viewports with room

  useWakeLock(running && !paused && !ended);

  const timeline = useMemo(() => buildTimeline(loops), [loops]);
  const totalSeconds = useMemo(() => timeline.reduce((a, s) => a + s.duration, 0), [timeline]);

  /* ── loop / interval mutators ───────────────────── */

  const updateLoop = (idx: number, patch: Partial<Loop>) =>
    setLoops((arr) => arr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const addLoop = () => setLoops((arr) => [...arr, newLoop()]);
  const removeLoop = (idx: number) =>
    setLoops((arr) => (arr.length > 1 ? arr.filter((_, i) => i !== idx) : arr));
  const duplicateLoop = (idx: number) =>
    setLoops((arr) => {
      const copy: Loop = {
        ...arr[idx],
        id: newId(),
        intervals: arr[idx].intervals.map((iv) => ({ ...iv, id: newId() })),
      };
      const next = [...arr];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  const moveLoop = (idx: number, dir: -1 | 1) =>
    setLoops((arr) => {
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });

  const updateInterval = (loopIdx: number, ivIdx: number, patch: Partial<Interval>) =>
    setLoops((arr) =>
      arr.map((l, i) =>
        i === loopIdx
          ? { ...l, intervals: l.intervals.map((iv, j) => (j === ivIdx ? { ...iv, ...patch } : iv)) }
          : l
      )
    );
  const addInterval = (loopIdx: number) =>
    setLoops((arr) =>
      arr.map((l, i) => (i === loopIdx ? { ...l, intervals: [...l.intervals, newInterval()] } : l))
    );
  const removeInterval = (loopIdx: number, ivIdx: number) =>
    setLoops((arr) =>
      arr.map((l, i) =>
        i === loopIdx && l.intervals.length > 1
          ? { ...l, intervals: l.intervals.filter((_, j) => j !== ivIdx) }
          : l
      )
    );
  const moveInterval = (loopIdx: number, ivIdx: number, dir: -1 | 1) =>
    setLoops((arr) =>
      arr.map((l, i) => {
        if (i !== loopIdx) return l;
        const j = ivIdx + dir;
        if (j < 0 || j >= l.intervals.length) return l;
        const ivs = [...l.intervals];
        [ivs[ivIdx], ivs[j]] = [ivs[j], ivs[ivIdx]];
        return { ...l, intervals: ivs };
      })
    );

  /* ── templates: loaded workouts need fresh ids so React keys stay unique ─── */
  const handleTemplateLoad = (loaded: Workout) => {
    const cloned: Workout = loaded.map((l) => ({
      ...l,
      id: newId(),
      intervals: l.intervals.map((iv) => ({ ...iv, id: newId() })),
    }));
    setLoops(cloned);
  };

  /* ── runtime heat compute ───────────────────────── */

  type HeatState = {
    display: string;
    loop: number;
    round: number;
    loopRounds: number;
    phase: 'WORK' | 'REST' | null;
    label: string;
    isTransition: boolean;
    beep: string | null;
    finished: boolean;
  };

  const empty = (display: string): HeatState => ({
    display,
    loop: 0,
    round: 0,
    loopRounds: 0,
    phase: null,
    label: '',
    isTransition: false,
    beep: null,
    finished: false,
  });

  const computeHeat = (offset: number): HeatState => {
    const rel = elapsed - offset;
    if (rel < 0) {
      const untilGo = COUNTDOWN_TIME - rel;
      return empty(formatMMSS(untilGo));
    }
    if (rel < COUNTDOWN_TIME) {
      const remaining = COUNTDOWN_TIME - rel;
      return {
        ...empty(String(remaining)),
        beep:
          remaining === 3 ? 'b1'
          : remaining === 2 ? 'b2'
          : remaining === 1 ? 'b3'
          : remaining === 0 ? 'final'
          : null,
      };
    }
    const t = rel - COUNTDOWN_TIME;
    if (t >= totalSeconds) {
      return {
        ...empty('00:00'),
        beep: t === totalSeconds ? 'final' : null,
        finished: true,
      };
    }
    let cursor = 0;
    for (const seg of timeline) {
      if (t < cursor + seg.duration) {
        const within = t - cursor;
        const remaining = seg.duration - within;
        let beep: string | null = null;
        if (remaining === 3) beep = 'b1';
        else if (remaining === 2) beep = 'b2';
        else if (remaining === 1) beep = 'b3';
        else if (within === 0) beep = 'final';
        return {
          display: formatMMSS(remaining),
          loop: seg.loop,
          round: seg.round,
          loopRounds: seg.loopRounds,
          phase: seg.phase,
          label: seg.label,
          isTransition: seg.isTransition,
          beep,
          finished: false,
        };
      }
      cursor += seg.duration;
    }
    return { ...empty('00:00'), finished: true };
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
    if (!totalSeconds) return;
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

  /* ── label resolution for the running display ───── */
  const heatLabel = (h: HeatState, heatNum: 1 | 2): string => {
    if (settings.heatsEnable) return `HEAT ${heatNum}`;
    if (h.isTransition) return 'TRANSITION';
    if (h.label) return h.label.toUpperCase();
    if (h.loop > 0) return `LOOP ${String(h.loop).padStart(2, '0')}`;
    return 'COMPLEX';
  };

  /* ── setup view ─────────────────────────────────── */
  if (!running) {
    const scrollToLoop = (loopNum: number) => {
      const id = loops[loopNum - 1]?.id;
      if (!id) return;
      const el = document.getElementById(`loop-card-${id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
      <>
        <div className="complex-shell">
          <div className="complex-shell__title">
            <h1>COMPLEX</h1>
          </div>

          <div className="complex-shell__body">
            <div className="workout-builder">
              {loops.map((loop, lIdx) => (
                <div key={loop.id} id={`loop-card-${loop.id}`}>
                  <LoopCard
                    loop={loop}
                    loopIdx={lIdx}
                    isFirst={lIdx === 0}
                    isLast={lIdx === loops.length - 1}
                    loopCount={loops.length}
                    onUpdate={(patch) => updateLoop(lIdx, patch)}
                    onDelete={() => removeLoop(lIdx)}
                    onDuplicate={() => duplicateLoop(lIdx)}
                    onMoveUp={() => moveLoop(lIdx, -1)}
                    onMoveDown={() => moveLoop(lIdx, 1)}
                    onUpdateInterval={(ivIdx, patch) => updateInterval(lIdx, ivIdx, patch)}
                    onAddInterval={() => addInterval(lIdx)}
                    onRemoveInterval={(ivIdx) => removeInterval(lIdx, ivIdx)}
                    onMoveInterval={(ivIdx, dir) => moveInterval(lIdx, ivIdx, dir)}
                  />
                </div>
              ))}
              <button type="button" className="btn-ghost" onClick={addLoop}>
                + ADD LOOP
              </button>
            </div>

            <TemplatesPanel<Workout>
              storageKey={COMPLEX_TEMPLATES_KEY}
              currentValue={loops}
              onLoad={handleTemplateLoad}
              noun="workout"
            />
          </div>

          <div className="complex-shell__footer">
            <div className="form-stack">
              <button
                type="button"
                className="form-stack__action"
                onClick={start}
                disabled={!totalSeconds}
              >
                START
              </button>
            </div>
            <div className="total-line">
              Total <span className="total-line__value">{formatMMSS(totalSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Drawer + handle MUST live outside .complex-shell — that element is
            position:fixed which creates its own stacking context (modern CSS spec),
            so any z-index inside it gets clipped to .complex-shell's effective z
            (auto/0), losing to the CustomHeader at z-60. Rendered as a sibling
            here they participate in the root stacking context and z-150 wins. */}
        {drawerAvailable && !drawerOpen && (
          <button
            type="button"
            className="timeline-handle"
            onClick={() => setDrawerOpen(true)}
            aria-label="open workout outline"
          >
            <span>OUTLINE</span>
          </button>
        )}

        {drawerAvailable && (
          <aside
            className={`timeline-drawer${drawerOpen ? ' is-open' : ''}`}
            aria-hidden={!drawerOpen}
          >
            <div className="timeline-drawer__head">
              <span className="timeline-drawer__title">OUTLINE</span>
              <button
                type="button"
                className="timeline-drawer__close"
                onClick={() => setDrawerOpen(false)}
                aria-label="close outline"
              >
                ✕
              </button>
            </div>
            <ComplexTimeline timeline={timeline} onSegmentClick={scrollToLoop} />
            <div className="timeline-drawer__stats">
              <span>
                LOOPS <strong>{loops.length}</strong>
              </span>
              <span>
                STEPS <strong>{timeline.length}</strong>
              </span>
              <span>
                TOTAL <strong>{formatMMSS(totalSeconds)}</strong>
              </span>
            </div>
          </aside>
        )}
      </>
    );
  }

  /* ── running view ───────────────────────────────── */
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
          showRound={elapsed >= COUNTDOWN_TIME && !heat1.isTransition}
          fontSize={fontSize}
          phase={heat1.phase}
          label={heatLabel(heat1, 1)}
        />
      }
      heat2={
        heat2 ? (
          <TimerDisplay
            time={heat2.display}
            round={heat2.round}
            showRound={elapsed >= settings.heatsDelay + COUNTDOWN_TIME && !heat2.isTransition}
            fontSize={fontSize}
            phase={heat2.phase}
            label={heatLabel(heat2, 2)}
          />
        ) : null
      }
      belowTimer={
        ended ? (
          <>
            <div className="status-text">WORKOUT · COMPLETE</div>
            <button type="button" className="btn-cmd" onClick={reset}>
              RESTART
            </button>
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

/* ── LoopCard ──────────────────────────────────────── */

interface LoopCardProps {
  loop: Loop;
  loopIdx: number;
  isFirst: boolean;
  isLast: boolean;
  loopCount: number;
  onUpdate: (patch: Partial<Loop>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateInterval: (ivIdx: number, patch: Partial<Interval>) => void;
  onAddInterval: () => void;
  onRemoveInterval: (ivIdx: number) => void;
  onMoveInterval: (ivIdx: number, dir: -1 | 1) => void;
}

const LoopCard: React.FC<LoopCardProps> = ({
  loop,
  loopIdx,
  isFirst,
  isLast,
  loopCount,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onUpdateInterval,
  onAddInterval,
  onRemoveInterval,
  onMoveInterval,
}) => {
  return (
    <div className="loop-card">
      <div className="loop-card__header">
        <span className="loop-card__title">Loop {String(loopIdx + 1).padStart(2, '0')}</span>
        <div className="loop-card__controls">
          <button type="button" className="icon-btn" onClick={onMoveUp} disabled={isFirst} aria-label="move loop up">↑</button>
          <button type="button" className="icon-btn" onClick={onMoveDown} disabled={isLast} aria-label="move loop down">↓</button>
          <button type="button" className="icon-btn" onClick={onDuplicate} aria-label="duplicate loop">⎘</button>
          <button type="button" className="icon-btn" onClick={onDelete} disabled={loopCount === 1} aria-label="delete loop">×</button>
        </div>
      </div>

      <div className="loop-card__rounds">
        <div className="form-stack">
          <FieldRow
            prefix="FOR"
            suffix="ROUNDS"
            value={loop.rounds}
            onChange={(v) => onUpdate({ rounds: v })}
            min={1}
          />
        </div>
      </div>

      <div className="intervals">
        <div className="intervals__heading">Intervals</div>
        {loop.intervals.map((iv, ivIdx) => (
          <div key={iv.id} className="interval-row">
            <span className="interval-row__index">{String(ivIdx + 1).padStart(2, '0')}</span>
            <div className="interval-row__field">
              <span className="interval-row__field-label">Work · sec</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={iv.work}
                onChange={(e) => onUpdateInterval(ivIdx, { work: Math.max(0, Number(e.target.value)) })}
                className="interval-row__input"
                aria-label={`interval ${ivIdx + 1} work seconds`}
              />
            </div>
            <div className="interval-row__field">
              <span className="interval-row__field-label">Rest · sec</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={iv.rest}
                onChange={(e) => onUpdateInterval(ivIdx, { rest: Math.max(0, Number(e.target.value)) })}
                className="interval-row__input"
                aria-label={`interval ${ivIdx + 1} rest seconds`}
              />
            </div>
            <div className="interval-row__controls">
              <button type="button" className="icon-btn icon-btn--small" onClick={() => onMoveInterval(ivIdx, -1)} disabled={ivIdx === 0} aria-label="move interval up">↑</button>
              <button type="button" className="icon-btn icon-btn--small" onClick={() => onMoveInterval(ivIdx, 1)} disabled={ivIdx === loop.intervals.length - 1} aria-label="move interval down">↓</button>
              <button type="button" className="icon-btn icon-btn--small" onClick={() => onRemoveInterval(ivIdx)} disabled={loop.intervals.length === 1} aria-label="remove interval">×</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={onAddInterval}>
          + ADD INTERVAL
        </button>
      </div>

      {!isLast && (
        <div className="loop-card__transition">
          <div className="form-stack">
            <FieldRow
              prefix="THEN REST"
              suffix="SECONDS"
              value={loop.transitionRest}
              onChange={(v) => onUpdate({ transitionRest: v })}
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Complex;
