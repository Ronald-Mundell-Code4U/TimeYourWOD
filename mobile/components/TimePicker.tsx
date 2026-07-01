import React from 'react';
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

export const TimePicker: React.FC<Props> = ({ value, onChange, showHours = false }) => {
  const { colors } = useTheme();
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;

  const emit = (hh: number, mm: number, ss: number) =>
    onChange(hh * 3600 + mm * 60 + ss);

  const cellStyle = [
    styles.cell,
    {
      color: colors.fg,
      borderColor: colors.line,
      backgroundColor: colors.bgElev,
      fontFamily: monoFont,
    },
  ];

  return (
    <View style={styles.row}>
      {showHours && (
        <>
          <TextInput
            style={cellStyle}
            keyboardType="number-pad"
            value={String(h).padStart(2, '0')}
            selectTextOnFocus
            maxLength={2}
            onChangeText={(t) => {
              const v = clamp(Number(t.replace(/[^0-9]/g, '') || 0), 0, 23);
              emit(v, m, s);
            }}
            accessibilityLabel="hours"
          />
          <Text style={[styles.colon, { color: colors.fgDim, fontFamily: monoFont }]}>:</Text>
        </>
      )}
      <TextInput
        style={cellStyle}
        keyboardType="number-pad"
        value={String(m).padStart(2, '0')}
        selectTextOnFocus
        maxLength={2}
        onChangeText={(t) => {
          const v = clamp(Number(t.replace(/[^0-9]/g, '') || 0), 0, 59);
          emit(h, v, s);
        }}
        accessibilityLabel="minutes"
      />
      <Text style={[styles.colon, { color: colors.fgDim, fontFamily: monoFont }]}>:</Text>
      <TextInput
        style={cellStyle}
        keyboardType="number-pad"
        value={String(s).padStart(2, '0')}
        selectTextOnFocus
        maxLength={2}
        onChangeText={(t) => {
          const v = clamp(Number(t.replace(/[^0-9]/g, '') || 0), 0, 59);
          emit(h, m, v);
        }}
        accessibilityLabel="seconds"
      />
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
