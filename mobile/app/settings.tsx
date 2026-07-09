import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';

import { useTheme } from '../theme/useTheme';
import { useSettings, BEEP_PACKS } from '../contexts/SettingsContext';
import { Toggle } from '../components/Toggle';
import { TimePicker } from '../components/TimePicker';
import { CmdButton } from '../components/CmdButton';
import { Select } from '../components/Select';

const Settings: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, audio } = useSettings();

  // beep preview state — schedules b1/b2/b3/final at 0/1/2/3s
  const [previewing, setPreviewing] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelPreview = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setPreviewing(false);
  };

  const playPreview = () => {
    if (previewing) return;
    cancelPreview();
    setPreviewing(true);
    audio.play('b1');
    timersRef.current = [
      setTimeout(() => audio.play('b2'), 1000),
      setTimeout(() => audio.play('b3'), 2000),
      setTimeout(() => audio.play('final'), 3000),
      setTimeout(() => {
        setPreviewing(false);
        timersRef.current = [];
      }, 4200),
    ];
  };

  // cancel scheduled beeps on pack switch / unmount
  useEffect(() => cancelPreview(), [settings.selectBeep]);
  useEffect(() => () => cancelPreview(), []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* custom header for the modal (so iOS gets a clean Close button) */}
      <View
        style={[styles.header, { paddingTop: 12 + insets.top, borderBottomColor: colors.line }]}
      >
        <Text style={[styles.headerTitle, { color: colors.fg }]}>SETTINGS</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="close settings"
        >
          <Ionicons name="close" size={26} color={colors.fg} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
      >
        <Section title="Theme" body="Display palette." colors={colors}>
          <Toggle
            isChecked={settings.theme === 'dark'}
            onToggle={() =>
              updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
            }
            labels={['DARK', 'LIGHT']}
          />
        </Section>

        <Section
          title="Heats"
          body="Run two heats per workout, separated by a configurable delay."
          colors={colors}
        >
          <Toggle
            isChecked={settings.heatsEnable}
            onToggle={() => updateSettings({ heatsEnable: !settings.heatsEnable })}
            labels={['ENABLED', 'DISABLED']}
          />
          {settings.heatsEnable && (
            <View style={{ alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Text style={[styles.fieldLabel, { color: colors.fgDim }]}>Delay · MM:SS</Text>
              <TimePicker
                value={settings.heatsDelay}
                onChange={(v) => updateSettings({ heatsDelay: v })}
              />
            </View>
          )}
        </Section>

        <Section
          title="For Time — Overtime"
          body="Once the cap is hit, the clock turns red and counts up for this duration. Set to 00:00 to disable."
          colors={colors}
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={[styles.fieldLabel, { color: colors.fgDim }]}>Overtime · MM:SS</Text>
            <TimePicker
              value={settings.fortime}
              onChange={(v) => updateSettings({ fortime: v })}
            />
          </View>
        </Section>

        <Section
          title="Beep pack"
          body="Pick the sound played at 3-2-1-GO."
          colors={colors}
        >
          <View style={{ gap: 12, alignItems: 'center', width: '100%' }}>
            <Select
              title="Beep pack"
              value={settings.selectBeep}
              options={BEEP_PACKS.map((p) => ({ label: p.name, value: p.id }))}
              onChange={(id) => updateSettings({ selectBeep: id })}
            />
            <CmdButton
              text={previewing ? 'PLAYING…' : 'PREVIEW 3 · 2 · 1 · GO'}
              onPress={playPreview}
              disabled={previewing}
            />
          </View>
        </Section>

        <Text style={[styles.version, { color: colors.fgDim }]}>
          v{Constants.expoConfig?.version ?? ''} · TimeYourWOD
        </Text>
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{
  title: string;
  body?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: React.ReactNode;
}> = ({ title, body, colors, children }) => (
  <View
    style={[
      styles.section,
      { borderColor: colors.line, backgroundColor: colors.bgSoft },
    ]}
  >
    <Text style={[styles.sectionTitle, { color: colors.fg }]}>{title}</Text>
    {body && <Text style={[styles.sectionBody, { color: colors.fgDim }]}>{body}</Text>}
    <View style={{ marginTop: 6 }}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
  },
  scroll: {
    padding: 18,
    gap: 14,
  },
  section: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    gap: 6,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 320,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 8,
  },
});

export default Settings;
