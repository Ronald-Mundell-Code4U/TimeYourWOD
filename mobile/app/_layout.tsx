import React, { useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { SettingsProvider } from '../contexts/SettingsContext';
import { SavedTimersProvider } from '../contexts/SavedTimersContext';
import { useTheme } from '../theme/useTheme';

// Hold the splash until the scoreboard font is ready, so screens never flash in
// system mono before JetBrains Mono loads.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
          // Native push (not fade_from_bottom): the fade cross-faded the header
          // and made the iOS 26 glass "Back" pill flash dark→light mid-transition.
          // The native slide lets iOS morph the back button cleanly.
          animation: 'default',
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
const RootLayout: React.FC = () => {
  const [fontsLoaded, fontError] = useFonts({ JetBrainsMono_700Bold });

  const onLayout = useCallback(() => {
    // hide the splash once the first frame with the font is committed
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // keep the splash up until the font resolves (loaded or errored → degrade to system mono)
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <SettingsProvider>
          <SavedTimersProvider>
            <InnerLayout />
          </SavedTimersProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
