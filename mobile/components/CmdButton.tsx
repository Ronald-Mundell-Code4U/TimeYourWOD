import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface Props {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
  size?: 'default' | 'large';
}

/**
 * Primary action button. Behavior intentionally mirrors `ModeButton` (the
 * Home screen mode chips): transparent fill with an `fg` border, inverts to
 * an `fg` fill with `bg` text on press. No scale-down on press — keeps the
 * feel identical to the home buttons.
 *
 * Ghost variant still adds a subtle `bgElev` tint + border lift, since it
 * doesn't fully invert.
 */
export const CmdButton: React.FC<Props> = ({
  text,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'default',
}) => {
  const { colors } = useTheme();
  const isGhost = variant === 'ghost';
  const isLarge = size === 'large';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={text}
      android_ripple={{ color: isGhost ? colors.bgElev : colors.fg, borderless: false }}
      style={({ pressed }) => {
        const active = pressed && !disabled;
        return [
          styles.base,
          {
            height: isLarge ? 64 : 48,
            minWidth: isLarge ? undefined : 140,
            paddingHorizontal: isLarge ? 18 : 22,
            // primary: always fg border. ghost: dim line, lifts to fg on press.
            borderColor: isGhost ? (active ? colors.fg : colors.line) : colors.fg,
            borderWidth: 2,
            // primary press = clean invert (fg fill). ghost press = subtle tint.
            backgroundColor: active
              ? isGhost
                ? colors.bgElev
                : colors.fg
              : 'transparent',
            opacity: disabled ? 0.4 : 1,
          },
          isLarge && styles.large,
        ];
      }}
    >
      {({ pressed }) => {
        const active = pressed && !disabled;
        return (
          <Text
            style={[
              styles.text,
              {
                // primary pressed → bg color (inverted). ghost text stays on fg.
                color: !isGhost && active ? colors.bg : colors.fg,
                fontSize: isLarge ? 18 : 14,
                letterSpacing: isLarge ? 3.5 : 2.8,
              },
            ]}
          >
            {text}
          </Text>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    overflow: 'hidden', // keep android_ripple inside the rounded border
  },
  large: {
    width: '100%',
    maxWidth: 200,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default CmdButton;
