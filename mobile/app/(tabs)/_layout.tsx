import React from 'react';
import { Pressable } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';

const TabsLayout: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/settings' as any)}
            hitSlop={12}
            style={{ paddingHorizontal: 16 }}
            accessibilityLabel="open settings"
          >
            <Ionicons name="settings-outline" size={22} color={colors.fg} />
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
        },
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.fgDim,
        tabBarLabelStyle: { fontWeight: '700', letterSpacing: 2, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TIMERS',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'SAVED',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'ABOUT',
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
