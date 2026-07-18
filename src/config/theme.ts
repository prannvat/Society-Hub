import { TextStyle, ViewStyle } from 'react-native';
import { societyConfig } from '@/config/societyConfig';
import { ThemeMode } from '@/types';

const baseSpacing = 4;

export const spacing = {
  xs: baseSpacing,
  sm: baseSpacing * 2,
  md: baseSpacing * 3,
  lg: baseSpacing * 4,
  xl: baseSpacing * 6,
  xxl: baseSpacing * 8,
  xxxl: baseSpacing * 12
};

export const radius = {
  sm: 4,
  input: 8,
  card: 8,
  lg: 12,
  xl: 20,
  pill: 100
};

export type ThemeColors = {
  // Brand
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  accent: string;
  // Surfaces
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceSunken: string;
  tabBarBackground: string;
  overlay: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;
  // Borders
  border: string;
  borderStrong: string;
  // Semantic
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  // Legacy aliases (kept for backward compatibility — prefer the tokens above)
  secondary: string;
  error: string;
};

// Instagram-style monochrome. Colour is reserved for meaning: blue for actions
// and links, red for a liked heart / destructive intent. Everything structural
// is black, white, and hairline grey.
const lightColors: ThemeColors = {
  primary: '#0095F6',
  primaryPressed: '#1878CC',
  primarySoft: '#E7F3FF',
  accent: '#ED4956',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#FAFAFA',
  tabBarBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.65)',

  textPrimary: '#000000',
  textSecondary: '#737373',
  textTertiary: '#8E8E8E',
  textOnPrimary: '#FFFFFF',

  border: '#DBDBDB',
  borderStrong: '#C7C7C7',

  danger: '#ED4956',
  dangerSoft: '#FFEBEC',
  success: '#2FA84F',
  successSoft: '#EAF7EE',
  warning: '#C97A0A',
  warningSoft: '#FDF3E6',

  secondary: '#737373',
  error: '#ED4956'
};

// Instagram dark mode is true black with #262626 hairlines. Same blue and red
// accents — they read cleanly on black without adjustment.
const darkColors: ThemeColors = {
  primary: '#0095F6',
  primaryPressed: '#1878CC',
  primarySoft: 'rgba(0, 149, 246, 0.16)',
  accent: '#ED4956',

  background: '#000000',
  surface: '#000000',
  surfaceElevated: '#121212',
  surfaceSunken: '#0A0A0A',
  tabBarBackground: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',

  textPrimary: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textTertiary: '#737373',
  textOnPrimary: '#FFFFFF',

  border: '#262626',
  borderStrong: '#363636',

  danger: '#ED4956',
  dangerSoft: 'rgba(237, 73, 86, 0.16)',
  success: '#2FA84F',
  successSoft: 'rgba(47, 168, 79, 0.16)',
  warning: '#E0A03A',
  warningSoft: 'rgba(224, 160, 58, 0.16)',

  secondary: '#A8A8A8',
  error: '#ED4956'
};

// Instagram's type is lighter and denser than a dashboard: mostly regular
// weight, semibold (600) for names and emphasis, no 800 anywhere. Big headings
// still tighten their tracking, but they don't shout.
const typeScale = {
  display: { fontSize: 30, fontWeight: '700', lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 30, letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '600', lineHeight: 21, letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 17 },
  captionMedium: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  micro: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.4, textTransform: 'uppercase' }
} satisfies Record<string, TextStyle>;

export type TypographyScale = typeof typeScale;
export type TypographyToken = keyof TypographyScale;

export type ElevationLevels = {
  e1: ViewStyle;
  e2: ViewStyle;
  e3: ViewStyle;
};

// Instagram separates with hairlines, not shadows. e1 is flat (in-flow tiles
// carry a border instead); e2/e3 stay subtle for genuinely floating layers —
// bottom sheets, dialogs — where a soft lift still reads.
const lightElevation: ElevationLevels = {
  e1: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10
  }
};

const darkElevation: ElevationLevels = {
  e1: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 4
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 12
  }
};

export const getTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';
  const elevation = isDark ? darkElevation : lightElevation;

  return {
    mode,
    colors: isDark ? darkColors : lightColors,
    spacing,
    radius,
    typography: {
      fontFamily: {
        heading: societyConfig.fonts.heading,
        body: societyConfig.fonts.body
      },
      ...typeScale
    },
    elevation,
    // Legacy single-shadow token — prefer theme.elevation.e1/e2/e3
    shadow: elevation.e2
  };
};

export type AppTheme = ReturnType<typeof getTheme>;
