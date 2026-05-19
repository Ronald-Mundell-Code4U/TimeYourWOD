import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CmdButton } from './CmdButton';
import { useTheme } from '../theme/useTheme';

interface Props {
  mode: string;
}

export const ComingSoon: React.FC<Props> = ({ mode }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Text style={[styles.eyebrow, { color: colors.fgDim }]}>{mode}</Text>
      <Text style={[styles.title, { color: colors.fg }]}>Coming soon</Text>
      <Text style={[styles.body, { color: colors.fgDim }]}>
        This mode is wired into the navigation but the runtime hasn't been ported from the web
        yet. Tabata is the first complete reference — the rest follow the same pattern.
      </Text>
      <CmdButton text="Back" variant="ghost" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  eyebrow: { fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  body: { fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 400 },
});

export default ComingSoon;
