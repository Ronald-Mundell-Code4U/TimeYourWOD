import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsProvider } from '../contexts/SettingsContext';
import { SavedTimersProvider } from '../contexts/SavedTimersContext';
import { useTheme } from '../theme/useTheme';

const InnerLayout: React.FC = () => {
  const { colors, name } = useTheme();
  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.fg,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade_from_bottom',
          headerBackTitle: 'Back',
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="clock" options={{ title: 'CLOCK' }} />
        <Stack.Screen name="tabata" options={{ title: 'TABATA' }} />
        <Stack.Screen name="for-time" options={{ title: 'FOR TIME' }} />
        <Stack.Screen name="amrap" options={{ title: 'AMRAP' }} />
        <Stack.Screen name="emom" options={{ title: 'EMOM' }} />
        <Stack.Screen name="complex" options={{ title: 'COMPLEX' }} />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
};

// Settings must wrap useTheme (useTheme reads from SettingsContext).
const RootLayout: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <SettingsProvider>
        <SavedTimersProvider>
          <InnerLayout />
        </SavedTimersProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
