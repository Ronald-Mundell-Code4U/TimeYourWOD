import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TimerDisplay } from '../components/TimerDisplay';
import { CmdButton } from '../components/CmdButton';
import { heatFontSize } from '../components/TimerScreen';
import { useTheme } from '../theme/useTheme';
import { formatStopwatch, pad } from '../shared/timer-utils';

type Mode = 'clock' | 'stopwatch';

const Clock: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [mode, setMode] = useState<Mode>('clock');
  const [now, setNow] = useState(new Date());

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);

  // wall clock tick
  useEffect(() => {
    if (mode !== 'clock') return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  // stopwatch tick (~30Hz for smooth centiseconds)
  useEffect(() => {
    if (mode !== 'stopwatch' || !running || paused) return;
    startRef.current = performance.now() - elapsedMs;
    const id = setInterval(() => {
      setElapsedMs(performance.now() - startRef.current);
    }, 33);
    return () => clearInterval(id);
    // see web Clock — startRef captures the offset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, running, paused]);

  const clockTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const display = mode === 'clock' ? clockTime : formatStopwatch(elapsedMs);

  // both formats are 8 chars (HH:MM:SS or MM:SS.cc)
  const fontSize = heatFontSize(width, height, false, 8);

  const reset = () => {
    setRunning(false);
    setPaused(false);
    setElapsedMs(0);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.timerArea}>
        <TimerDisplay time={display} fontSize={fontSize} />
      </View>

      <View
        style={[
          styles.controls,
          { paddingBottom: 16 + insets.bottom, paddingLeft: insets.left + 16, paddingRight: insets.right + 16 },
        ]}
      >
        {/* Action row — ALWAYS rendered with reserved height so the
            mode toggle below doesn't move when start/pause/reset show up. */}
        <View style={[styles.actionRow]}>
          {mode === 'stopwatch' &&
            (!running ? (
              <CmdButton text="START" onPress={() => setRunning(true)} />
            ) : (
              <>
                <CmdButton
                  text={paused ? 'RESUME' : 'PAUSE'}
                  onPress={() => setPaused((p) => !p)}
                />
                <CmdButton text="RESET" variant="ghost" onPress={reset} />
              </>
            ))}
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <Pressable
            onPress={() => {
              setMode('clock');
              reset();
            }}
            style={[
              styles.modePill,
              {
                borderColor: mode === 'clock' ? colors.fg : colors.line,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'clock' }}
          >
            <Text style={[styles.modeText, { color: mode === 'clock' ? colors.fg : colors.fgDim }]}>
              CLOCK
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('stopwatch')}
            style={[
              styles.modePill,
              {
                borderColor: mode === 'stopwatch' ? colors.fg : colors.line,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'stopwatch' }}
          >
            <Text style={[styles.modeText, { color: mode === 'stopwatch' ? colors.fg : colors.fgDim }]}>
              STOPWATCH
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  timerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  controls: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  actionRow: {
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modePill: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
});

export default Clock;
