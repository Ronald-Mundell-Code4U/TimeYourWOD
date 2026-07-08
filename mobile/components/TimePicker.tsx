import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { monoFont } from '../theme';

interface Props {
  /** total value in seconds */
  value: number;
  onChange: (totalSeconds: number) => void;
  showHours?: boolean;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

/**
 * One MM / SS / HH cell. Tracks the raw typed text while focused so a two-digit
 * value (e.g. "30") can actually be entered — a controlled, always-zero-padded
 * value + maxLength=2 made the field full after the first digit, so only a
 * single digit could ever be typed. On blur it re-pads for display.
 */
const Cell: React.FC<{
  value: number;
  max: number;
  onCommit: (n: number) => void;
  accessibilityLabel: string;
}> = ({ value, max, onCommit, accessibilityLabel }) => {
  const { colors } = useTheme();
  const [raw, setRaw] = useState(String(value).padStart(2, '0'));
  const editing = useRef(false);

  // sync display from the parent when not actively editing
  useEffect(() => {
    if (!editing.current) setRaw(String(value).padStart(2, '0'));
  }, [value]);

  return (
    <TextInput
      style={[
        styles.cell,
        {
          color: colors.fg,
          borderColor: colors.line,
          backgroundColor: colors.bgElev,
          fontFamily: monoFont,
        },
      ]}
      keyboardType="number-pad"
      value={raw}
      maxLength={2}
      selectTextOnFocus
      onFocus={() => {
        editing.current = true;
        setRaw(''); // start empty so the first keystroke isn't fighting a padded "0X"
      }}
      onBlur={() => {
        editing.current = false;
        setRaw(String(value).padStart(2, '0'));
      }}
      onChangeText={(t) => {
        const digits = t.replace(/[^0-9]/g, '').slice(0, 2);
        setRaw(digits);
        onCommit(clamp(Number(digits || 0), 0, max));
      }}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

export const TimePicker: React.FC<Props> = ({ value, onChange, showHours = false }) => {
  const { colors } = useTheme();
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;

  const emit = (hh: number, mm: number, ss: number) => onChange(hh * 3600 + mm * 60 + ss);

  return (
    <View style={styles.row}>
      {showHours && (
        <>
          <Cell value={h} max={23} onCommit={(v) => emit(v, m, s)} accessibilityLabel="hours" />
          <Text style={[styles.colon, { color: colors.fgDim, fontFamily: monoFont }]}>:</Text>
        </>
      )}
      <Cell value={m} max={59} onCommit={(v) => emit(h, v, s)} accessibilityLabel="minutes" />
      <Text style={[styles.colon, { color: colors.fgDim, fontFamily: monoFont }]}>:</Text>
      <Cell value={s} max={59} onCommit={(v) => emit(h, m, v)} accessibilityLabel="seconds" />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cell: {
    width: 64,
    height: 56,
    borderWidth: 2,
    borderRadius: 2,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  colon: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});

export default TimePicker;
