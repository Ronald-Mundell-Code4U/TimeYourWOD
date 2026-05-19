import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModeButton } from '../../components/ModeButton';
import { useTheme } from '../../theme/useTheme';

const MODES = [
  { text: 'CLOCK', href: '/clock' },
  { text: 'TABATA', href: '/tabata' },
  { text: 'FOR TIME', href: '/for-time' },
  { text: 'EMOM', href: '/emom' },
  { text: 'AMRAP', href: '/amrap' },
  { text: 'COMPLEX', href: '/complex' },
] as const;

const Home: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: 16 + insets.top,
          paddingBottom: 16 + insets.bottom,
        },
      ]}
    >
      <View style={[styles.header, { marginBottom: isLandscape ? 16 : 32 }]}>
        <Text
          style={[
            styles.title,
            { color: colors.fg, fontSize: isLandscape ? 32 : 44 },
          ]}
        >
          TIMEYOURWOD
        </Text>
      </View>

      <View style={[styles.nav, isLandscape ? styles.navLandscape : null]}>
        {MODES.map((m) => (
          <View
            key={m.href}
            style={isLandscape ? styles.cellLandscape : styles.cellPortrait}
          >
            <ModeButton text={m.text} href={m.href} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    maxWidth: 720,
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  // portrait: single column
  nav: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  // landscape: 2-column wrap, wider container
  navLandscape: {
    maxWidth: 720,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 12,
    rowGap: 12,
  },
  cellPortrait: { width: '100%' },
  cellLandscape: {
    // 50% minus half the column gap so two cells fit per row
    width: '48%',
    maxWidth: 340,
  },
});

export default Home;
