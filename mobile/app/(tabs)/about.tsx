import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { CmdButton } from '../../components/CmdButton';

const KOFI_URL = 'https://ko-fi.com/timeyourwod';
const WEB_URL = 'https://timeyourwod.code4u.app';

const About: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 24 + insets.top, paddingBottom: 32 + insets.bottom },
      ]}
    >
      <Text style={[styles.title, { color: colors.fg }]}>ABOUT US</Text>

      <Section title="Why we built this" colors={colors}>
        TimeYourWOD is a workout-of-the-day timer for the gym floor. Six modes — Clock, Tabata,
        For Time, EMOM, AMRAP, and Complex — each tuned to the way coaches actually count.
      </Section>

      <Section title="Our story" colors={colors}>
        I was diagnosed with autism as an adult. The diagnosis came after years of trying to
        understand why life felt harder than it seemed to for everyone else, and it opened my
        eyes to how many people quietly struggle without the support that an early diagnosis
        would have made possible.
      </Section>

      <Section title="Our mission" colors={colors}>
        A portion of any platform proceeds is dedicated to raising awareness and support for
        those with autism. If the app made your training a little better, paying it forward
        helps someone else.
      </Section>

      <View style={styles.actions}>
        <CmdButton text="Support on Ko-fi" onPress={() => Linking.openURL(KOFI_URL)} />
        <CmdButton
          text="Open the web version"
          variant="ghost"
          onPress={() => Linking.openURL(WEB_URL)}
        />
      </View>

      <Text style={[styles.signoff, { color: colors.fg }]}>
        Warm regards,{'\n'}Ronald Mundell
      </Text>
    </ScrollView>
  );
};

const Section: React.FC<{
  title: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}> = ({ title, colors, children }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.fg }]}>{title}</Text>
    <Text style={[styles.body, { color: colors.fgDim }]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 10,
  },
  body: { fontSize: 15, lineHeight: 22 },
  actions: { gap: 10, alignItems: 'center', marginTop: 8, marginBottom: 24 },
  signoff: { fontSize: 14, marginTop: 8 },
});

export default About;
