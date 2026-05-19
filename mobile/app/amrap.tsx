import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';

import { FieldRow } from '../components/FieldRow';
import { CmdButton } from '../components/CmdButton';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerScreen, heatFontSize } from '../components/TimerScreen';
import { SaveModal } from '../components/SaveModal';
import { SetupShell } from '../components/SetupShell';
import { useTheme } from '../theme/useTheme';
import { useSettings } from '../contexts/SettingsContext';
import { useSavedTimers } from '../contexts/SavedTimersContext';
import { COUNTDOWN_TIME, beepFor, formatMMSS, formatTimeFromNow } from '../shared/timer-utils';
import { useTimerEngine } from '../shared/useTimerEngine';
import type { AmrapConfig } from '../shared/types';

const Amrap: React.FC = () => {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { timers, markRun } = useSavedTimers();
  const navigation = useNavigation();
  const { savedId } = useLocalSearchParams<{ savedId?: string }>();
  const { width, height } = useWindowDimensions();

  const [duration, setDuration] = useState(10);
  const [loadedFromId, setLoadedFromId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    if (!savedId) return;
    const t = timers.find((x) => x.id === savedId);
    if (!t || t.mode !== 'amrap') return;
    setDuration((t.config as AmrapConfig).duration);
    setLoadedFromId(t.id);
  }, [savedId, timers]);

  const engine = useTimerEngine();
  const { running, paused, ended, elapsed, fireBeep } = engine;

  useKeepAwake(running && !paused && !ended ? 'amrap' : undefined);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !running ? (
          <Pressable
            onPress={() => setSaveOpen(true)}
            hitSlop={12}
            style={{ paddingHorizontal: 12 }}
            accessibilityLabel="save AMRAP workout"
          >
            <Ionicons name="bookmark-outline" size={22} color={colors.fg} />
          </Pressable>
        ) : null,
    });
  }, [navigation, running, colors.fg]);

  const totalSeconds = duration * 60;

  type HeatState = {
    display: string;
    beep: ReturnType<typeof beepFor>;
    finished: boolean;
  };

  const computeHeat = useCallback(
    (offset: number): HeatState => {
      const rel = elapsed - offset;
      if (rel < 0) {
        return { display: formatMMSS(COUNTDOWN_TIME - rel), beep: null, finished: false };
      }
      if (rel < COUNTDOWN_TIME) {
        const remaining = COUNTDOWN_TIME - rel;
        return { display: String(remaining), beep: beepFor(remaining), finished: false };
      }
      const t = rel - COUNTDOWN_TIME;
      if (t >= 0 && t < totalSeconds) {
        const remaining = totalSeconds - t;
        let beep: ReturnType<typeof beepFor> = beepFor(remaining);
        if (!beep && t === 0) beep = 'final';
        return { display: formatMMSS(remaining), beep, finished: false };
      }
      return { display: '00:00', beep: t === totalSeconds ? 'final' : null, finished: true };
    },
    [elapsed, totalSeconds]
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
    if (!duration) return;
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

  if (!running) {
    return (
      <SetupShell>
        <View style={{ width: '100%', alignItems: 'center', gap: 18 }}>
          <FieldRow prefix="FOR" suffix="MINUTES" value={duration} onChange={setDuration} min={1} />
        </View>

        <CmdButton text="START" onPress={start} disabled={!duration} size="large" />

        <SaveModal
          visible={saveOpen}
          mode="amrap"
          defaultName={loadedFromId ? timers.find((t) => t.id === loadedFromId)?.name ?? '' : ''}
          config={{ duration }}
          existingId={loadedFromId}
          onClose={() => setSaveOpen(false)}
          onSaved={(rec) => {
            setLoadedFromId(rec.id);
            setSaveOpen(false);
            Alert.alert('Saved', `"${rec.name}" is in Saved.`);
          }}
        />
      </SetupShell>
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
          fontSize={fontSize}
          label={settings.heatsEnable ? 'HEAT 1' : undefined}
        />
      }
      heat2={
        heat2 ? (
          <TimerDisplay time={heat2.display} fontSize={fontSize} label="HEAT 2" />
        ) : null
      }
      belowTimer={
        ended ? (
          <>
            <Text style={{ color: colors.fgDim, letterSpacing: 2.5, fontSize: 14 }}>
              {duration} MIN · COMPLETE
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <CmdButton text="RESTART" onPress={start} />
              <CmdButton text="SAVE" onPress={() => setSaveOpen(true)} />
              <CmdButton text="EXIT" onPress={() => { engine.reset(); router.back(); }} />
            </View>
            <SaveModal
              visible={saveOpen}
              mode="amrap"
              defaultName={loadedFromId ? timers.find((t) => t.id === loadedFromId)?.name ?? '' : ''}
              config={{ duration }}
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

export default Amrap;
