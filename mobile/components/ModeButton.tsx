import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../theme/useTheme';

interface Props {
  text: string;
  href: string;
}

export const ModeButton: React.FC<Props> = ({ text, href }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(href as any)}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={({ pressed }) => [
        styles.btn,
        {
          borderColor: colors.fg,
          backgroundColor: pressed ? colors.fg : 'transparent',
        },
      ]}
    >
      {({ pressed }) => (
        <View style={styles.inner}>
          <Text style={[styles.text, { color: pressed ? colors.bg : colors.fg }]}>{text}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    maxWidth: 420,
    minHeight: 56,
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 22,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default ModeButton;
