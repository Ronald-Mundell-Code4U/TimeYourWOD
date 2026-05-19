import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  time: string;
  fontSize: number;
  label?: string;
  round?: number;
  showRound?: boolean;
  phase?: 'WORK' | 'REST' | null;
  overtime?: boolean;
  /** when true, reserve label/round/phase rows even if empty so heats stay equal-height */
  reserveSlots?: boolean;
}

export const TimerDisplay: React.FC<Props> = ({
  time,
  fontSize,
  label,
  round = 0,
  showRound = false,
  phase,
  overtime = false,
  reserveSlots = true,
}) => {
  const { colors } = useTheme();

  const showLabel = !!label;
  const showRoundLine = showRound && round > 0;
  const showPhase = !!phase;

  const labelSize = Math.max(10, fontSize * 0.07);
  const roundSize = Math.max(14, fontSize * 0.12);
  const phaseSize = Math.max(12, fontSize * 0.1);

  return (
    <View style={styles.col}>
      {showLabel && (
        <Text
          style={[styles.kbd, { color: colors.fgDim, fontSize: labelSize }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      {(showRoundLine || reserveSlots) && (
        <Text
          style={[
            styles.round,
            { color: colors.fgDim, fontSize: roundSize, opacity: showRoundLine ? 1 : 0 },
          ]}
          numberOfLines={1}
        >
          ROUND <Text style={{ color: colors.fg }}>{showRoundLine ? String(round).padStart(2, '0') : '00'}</Text>
        </Text>
      )}
      {(showPhase || reserveSlots) && (
        <Text
          style={[
            styles.phase,
            {
              color: phase === 'REST' ? colors.fgDim : colors.fg,
              fontSize: phaseSize,
              opacity: showPhase ? 1 : 0,
            },
          ]}
          numberOfLines={1}
        >
          {showPhase ? phase : 'WORK'}
        </Text>
      )}
      <Text
        style={[
          styles.scoreboard,
          {
            color: overtime ? colors.alert : colors.fg,
            fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {time}
      </Text>
    </View>
  );
};

const monoFont = Platform.select({ ios: 'Menlo', android: 'monospace' });

const styles = StyleSheet.create({
  col: {
    alignItems: 'center',
    gap: 2,
  },
  kbd: {
    letterSpacing: 2.4,
    fontWeight: '500',
    textTransform: 'uppercase',
    fontFamily: monoFont,
  },
  round: {
    letterSpacing: 2.6,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: monoFont,
  },
  phase: {
    letterSpacing: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: monoFont,
  },
  scoreboard: {
    fontWeight: '800',
    letterSpacing: -2,
    fontFamily: monoFont,
    fontVariant: ['tabular-nums'],
  },
});

export default TimerDisplay;
