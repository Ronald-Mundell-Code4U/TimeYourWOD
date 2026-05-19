import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { palette, type Colors, type ThemeName } from './index';

export const useTheme = (): { name: ThemeName; colors: Colors } => {
  const ctx = useContext(SettingsContext);
  const name: ThemeName = ctx?.settings.theme === 'light' ? 'light' : 'dark';
  return { name, colors: palette[name] };
};
