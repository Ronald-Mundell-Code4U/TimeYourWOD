import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  isChecked: boolean;
  onToggle: () => void;
  /** [onLabel, offLabel] — width is reserved for the longer of the two so adjacent items don't shift */
  labels: [string, string];
}

export const Toggle: React.FC<Props> = ({ isChecked, onToggle, labels }) => {
  const { colors } = useTheme();
  const longest = labels[0].length >= labels[1].length ? labels[0] : labels[1];

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: isChecked }}
      style={[styles.btn, { borderColor: colors.line }]}
    >
      <View
        style={[
          styles.track,
          { backgroundColor: isChecked ? colors.fg : colors.bgElev, borderColor: colors.line },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: isChecked ? colors.bg : colors.fg,
              left: isChecked ? 19 : 1,
            },
          ]}
        />
      </View>
      {/* fixed-width text slot using a hidden ghost to reserve width */}
      <View style={styles.labelSlot}>
        <Text style={[styles.label, styles.ghost, { color: colors.fg }]}>{longest}</Text>
        <Text
          style={[
            styles.label,
            styles.real,
            { color: isChecked ? colors.fg : colors.fgDim },
          ]}
        >
          {isChecked ? labels[0] : labels[1]}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 14,
    height: 44,
  },
  track: {
    width: 36,
    height: 18,
    borderRadius: 2,
    borderWidth: 1,
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: 1,
    width: 14,
    height: 14,
  },
  labelSlot: {
    position: 'relative',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ghost: {
    opacity: 0,
  },
  real: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});

export default Toggle;
