import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  prefix: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  /** advisory only — START button is what actually blocks invalid configs */
  min?: number;
  max?: number;
}

const monoFont = Platform.select({ ios: 'Menlo', android: 'monospace' });

export const FieldRow: React.FC<Props> = ({
  prefix,
  suffix,
  value,
  onChange,
  min = 0,
  max,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Responsive labels, fixed-size input cell so it lines up with the START button.
  const narrow = width < 380;
  const labelW = narrow ? 72 : 100;
  const inputW = 200; // matches CmdButton large maxWidth
  const inputH = 64;  // matches CmdButton large height
  const fontPx = 26;
  const gap = narrow ? 10 : 14;

  // Track raw text separately so the user can clear the field (going to "")
  // without it snapping back to a number. The parsed numeric value (0 when
  // empty) propagates to the parent, which uses it to disable the START button.
  const [raw, setRaw] = useState(String(value));
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current && value !== Number(raw)) setRaw(String(value));
    // intentionally not tracking `raw` — only sync when parent pushes a change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setRaw(cleaned);
    if (cleaned === '') {
      onChange(0);
      return;
    }
    let n = Number(cleaned);
    if (Number.isNaN(n)) n = 0;
    if (max !== undefined && n > max) {
      n = max;
      setRaw(String(n));
    }
    onChange(n);
  };

  return (
    <View style={[styles.row, { gap }]}>
      <Text
        style={[
          styles.label,
          styles.prefix,
          { color: colors.fg, width: labelW },
        ]}
        numberOfLines={1}
      >
        {prefix}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.fg,
            borderColor: colors.fg,
            fontFamily: monoFont,
            width: inputW,
            height: inputH,
            fontSize: fontPx,
          },
        ]}
        keyboardType="number-pad"
        value={raw}
        onChangeText={handle}
        onFocus={() => { editing.current = true; }}
        onBlur={() => { editing.current = false; }}
        selectTextOnFocus
        maxLength={5}
        accessibilityLabel={`${prefix} ${suffix}`.trim()}
      />
      <Text
        style={[
          styles.label,
          styles.suffix,
          { color: colors.fg, width: labelW },
        ]}
        numberOfLines={1}
      >
        {suffix}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 560,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  prefix: { textAlign: 'right' },
  suffix: { textAlign: 'left' },
  input: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 14,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

export default FieldRow;
