import React from 'react';
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

  const handle = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let n = cleaned === '' ? min : Number(cleaned);
    if (Number.isNaN(n)) n = min;
    if (n < min) n = min;
    if (max !== undefined && n > max) n = max;
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
        value={String(value)}
        onChangeText={handle}
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
