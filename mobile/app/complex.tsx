import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoopCard } from '../components/LoopCard';
import { CmdButton } from '../components/CmdButton';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerScreen, heatFontSize } from '../components/TimerScreen';
import { SaveModal } from '../components/SaveModal';
import { useTheme } from '../theme/useTheme';
import { useSettings } from '../contexts/SettingsContext';
import { useSavedTimers } from '../contexts/SavedTimersContext';
import { COUNTDOWN_TIME, beepFor, formatMMSS, formatTimeFromNow } from '../shared/timer-utils';
import { useTimerEngine } from '../shared/useTimerEngine';
import { buildTimeline, timelineTotal } from '../shared/complex-timeline';
import { newId, newLoop, type Interval, type Loop, type Workout } from '../shared/types';

const Complex: React.FC = () => {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { timers, markRun } = useSavedTimers();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { savedId } = useLocalSearchParams<{ savedId?: string }>();
  const { width, height } = useWindowDimensions();

  const [loops, setLoops] = useState<Workout>([newLoop()]);
  const [loadedFromId, setLoadedFromId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (!savedId) return;
    const t = timers.find((x) => x.id === savedId);
    if (!t || t.mode !== 'complex') return;
    const src = t.config as Workout;
    // re-id everything so React keys don't collide
    const cloned: Workout = src.map((l) => ({
      ...l,
      id: newId(),
      intervals: l.intervals.map((iv) => ({ ...iv, id: newId() })),
    }));
    setLoops(cloned);
    setLoadedFromId(t.id);
  }, [savedId, timers]);

  // ── mutators ──
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
      arr.map((l, i) =>
        i === loopIdx ? { ...l, intervals: [...l.intervals, { id: newId(), label: '', work: 30, rest: 10 }] } : l
      )
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

  // ── runtime ──
  const engine = useTimerEngine();
  const { running, paused, ended, elapsed, fireBeep } = engine;
  useKeepAwake(running && !paused && !ended ? 'complex' : undefined);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !running ? (
          <Pressable
            onPress={() => setSaveOpen(true)}
            hitSlop={12}
            style={{ paddingHorizontal: 12 }}
            accessibilityLabel="save Complex workout"
          >
            <Ionicons name="bookmark-outline" size={22} color={colors.fg} />
          </Pressable>
        ) : null,
    });
  }, [navigation, running, colors.fg]);

  const timeline = useMemo(() => buildTimeline(loops), [loops]);
  const totalSeconds = useMemo(() => timelineTotal(timeline), [timeline]);

  type HeatState = {
    display: string;
    loop: number;
    round: number;
    phase: 'WORK' | 'REST' | null;
    label: string;
    isTransition: boolean;
    beep: ReturnType<typeof beepFor>;
    finished: boolean;
  };

  const empty = (display: string): HeatState => ({
    display,
    loop: 0,
    round: 0,
    phase: null,
    label: '',
    isTransition: false,
    beep: null,
    finished: false,
  });

  const computeHeat = useCallback(
    (offset: number): HeatState => {
      const rel = elapsed - offset;
      if (rel < 0) return empty(formatMMSS(COUNTDOWN_TIME - rel));
      if (rel < COUNTDOWN_TIME) {
        const remaining = COUNTDOWN_TIME - rel;
        return { ...empty(String(remaining)), beep: beepFor(remaining) };
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
          let beep: ReturnType<typeof beepFor> = beepFor(remaining);
          if (!beep && within === 0) beep = 'final';
          return {
            display: formatMMSS(remaining),
            loop: seg.loop,
            round: seg.round,
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
    },
    [elapsed, totalSeconds, timeline]
  );

  const heat1 = useMemo(() => computeHeat(0), [computeHeat]);
  const heat2 = useMemo(
    () => (settings.heatsEnable ? computeHeat(settings.heatsDelay) : null),
    [settings.heatsEnable, settings.heatsDelay, computeHeat]
  );

  useEffect(() => {
    fireBeep('h1', heat1.beep);
    if (heat2) fireBeep('h2', heat2.beep);
  }, [elapsed, heat1.beep, heat2?.beep]);

  useEffect(() => {
    if (!running || ended) return;
    const h1Done = heat1.finished;
    const h2Done = !settings.heatsEnable || (heat2?.finished ?? false);
    if (h1Done && h2Done) engine.markEnded();
  }, [heat1.finished, heat2?.finished, settings.heatsEnable, running, ended]);

  const start = () => {
    if (!totalSeconds) return;
    engine.start();
    if (loadedFromId) markRun(loadedFromId);
  };

  const progress = (() => {
    const rel = elapsed - COUNTDOWN_TIME;
    if (rel <= 0) return 0;
    return Math.min(1, rel / totalSeconds);
  })();

  const h1End = COUNTDOWN_TIME + totalSeconds - elapsed;
  const h2End = settings.heatsDelay + COUNTDOWN_TIME + totalSeconds - elapsed;

  const heatLabel = (h: HeatState, num: 1 | 2): string | undefined => {
    if (settings.heatsEnable) return `HEAT ${num}`;
    if (h.isTransition) return 'TRANSITION';
    if (h.label) return h.label.toUpperCase();
    if (h.loop > 0) return `LOOP ${String(h.loop).padStart(2, '0')}`;
    return undefined; // header already shows "COMPLEX"
  };

  if (!running) {
    return (
      <View style={[styles.shell, { backgroundColor: colors.bg }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 16,
            paddingHorizontal: 14,
            gap: 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {loops.map((loop, lIdx) => (
            <LoopCard
              key={loop.id}
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
          ))}

          <Pressable
            onPress={addLoop}
            style={({ pressed }) => [
              styles.addLoop,
              { borderColor: pressed ? colors.fg : colors.line },
            ]}
          >
            <Text style={[styles.addLoopText, { color: colors.fg }]}>+ ADD LOOP</Text>
          </Pressable>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { borderTopColor: colors.line, paddingBottom: 14 + insets.bottom },
          ]}
        >
          <CmdButton text="START" onPress={start} disabled={!totalSeconds} size="large" />
          <Text style={[styles.total, { color: colors.fgDim }]}>
            Total{' '}
            <Text style={{ color: colors.fg, fontWeight: '700' }}>
              {formatMMSS(totalSeconds)}
            </Text>
          </Text>
        </View>

        <SaveModal
          visible={saveOpen}
          mode="complex"
          defaultName={loadedFromId ? timers.find((t) => t.id === loadedFromId)?.name ?? '' : ''}
          config={loops}
          existingId={loadedFromId}
          onClose={() => setSaveOpen(false)}
          onSaved={(rec) => {
            setLoadedFromId(rec.id);
            setSaveOpen(false);
            Alert.alert('Saved', `"${rec.name}" is in Saved.`);
          }}
        />
      </View>
    );
  }

  const fontSize = heatFontSize(width, height, settings.heatsEnable, 5, ended ? 160 : 0);

  return (
    <TimerScreen
      progress={progress}
      paused={paused}
      running
      onTogglePause={() => !ended && engine.togglePause()}
      onReset={engine.reset}
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
            <Text style={{ color: colors.fgDim, letterSpacing: 2.5, fontSize: 14 }}>
              WORKOUT · COMPLETE
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <CmdButton text="RESTART" onPress={start} />
              <CmdButton text="SAVE" onPress={() => setSaveOpen(true)} />
              <CmdButton text="EXIT" onPress={() => { engine.reset(); router.back(); }} />
            </View>
            <SaveModal
              visible={saveOpen}
              mode="complex"
              defaultName={loadedFromId ? timers.find((t) => t.id === loadedFromId)?.name ?? '' : ''}
              config={loops}
              existingId={loadedFromId}
              onClose={() => setSaveOpen(false)}
              onSaved={(rec) => {
                setLoadedFromId(rec.id);
                setSaveOpen(false);
                Alert.alert('Saved', `"${rec.name}" is in Saved.`);
              }}
            />
          </>
        ) : settings.heatsEnable ? (
          <View style={{ flexDirection: 'row', gap: 24 }}>
            <Text style={{ color: colors.fgDim, letterSpacing: 2, fontSize: 12 }}>
              HEAT 1 ENDS · {formatTimeFromNow(h1End)}
            </Text>
            <Text style={{ color: colors.fgDim, letterSpacing: 2, fontSize: 12 }}>
              HEAT 2 ENDS · {formatTimeFromNow(h2End)}
            </Text>
          </View>
        ) : (
          <Text style={{ color: colors.fgDim, letterSpacing: 2, fontSize: 12 }}>
            WORKOUT ENDS · {formatTimeFromNow(h1End)}
          </Text>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  shell: { flex: 1 },
  addLoop: {
    borderWidth: 2,
    borderRadius: 2,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addLoopText: {
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  total: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});

export default Complex;
