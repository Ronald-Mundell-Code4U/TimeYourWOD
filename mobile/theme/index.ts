// Design tokens — mirror of the web's CSS custom properties.

export const palette = {
  dark: {
    bg: '#0a0a0a',
    bgSoft: '#141414',
    bgElev: '#1c1c1c',
    fg: '#f5f1e8',
    fgDim: '#8a857a',
    line: '#2a2a2a',
    accent: '#f5f1e8',
    alert: '#c43c3c',
    overlay: 'rgba(10, 10, 10, 0.72)',
  },
  light: {
    bg: '#f7f6f2',
    bgSoft: '#efede7',
    bgElev: '#e4e1d8',
    fg: '#0a0a0a',
    fgDim: '#6a6660',
    line: '#d4cfc2',
    accent: '#0a0a0a',
    alert: '#a02828',
    overlay: 'rgba(247, 246, 242, 0.82)',
  },
} as const;

export type ThemeName = keyof typeof palette;
export type Colors = (typeof palette)[ThemeName];

// JetBrains Mono is bundled + loaded in app/_layout.tsx (useFonts, splash held
// until ready), matching the web scoreboard. Components use `monoFont` directly.
export const monoFont = 'JetBrainsMono_700Bold';

export const fonts = {
  mono: monoFont,
  monoFallback: 'Menlo',
  display: 'System',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
} as const;
