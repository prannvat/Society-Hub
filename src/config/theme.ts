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
  sm: 6,
  input: 12,
  card: 12,
  lg: 16,
  xl: 24,
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

const lightColors: ThemeColors = {
  primary: '#4F46E5',
  primaryPressed: '#4338CA',
  primarySoft: '#EEF2FF',
  accent: '#D97706',

  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSunken: '#ECEDF4',
  tabBarBackground: '#FFFFFF',
  overlay: 'rgba(15, 17, 34, 0.45)',

  textPrimary: '#131524',
  textSecondary: '#565B6E',
  textTertiary: '#6E7287',
  textOnPrimary: '#FFFFFF',

  border: '#E3E5EF',
  borderStrong: '#C8CBDA',

  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#B45309',
  warningSoft: '#FFFBEB',

  secondary: '#565B6E',
  error: '#DC2626'
};

const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryPressed: '#6B76F0',
  primarySoft: 'rgba(129, 140, 248, 0.16)',
  accent: '#FBBF24',

  background: '#0B0C14',
  surface: '#15161F',
  surfaceElevated: '#1D1E2B',
  surfaceSunken: '#07080D',
  tabBarBackground: '#12131C',
  overlay: 'rgba(0, 0, 0, 0.6)',

  textPrimary: '#F4F5FA',
  textSecondary: '#A6A9BC',
  textTertiary: '#84879B',
  textOnPrimary: '#14163A',

  border: '#262838',
  borderStrong: '#3A3D52',

  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.14)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.14)',

  secondary: '#A6A9BC',
  error: '#F87171'
};

const typeScale = {
  display: { fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '700', lineHeight: 22, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.8, textTransform: 'uppercase' }
} satisfies Record<string, TextStyle>;

export type TypographyScale = typeof typeScale;
export type TypographyToken = keyof TypographyScale;

export type ElevationLevels = {
  e1: ViewStyle;
  e2: ViewStyle;
  e3: ViewStyle;
};

const lightElevation: ElevationLevels = {
  e1: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1
  },
  e2: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  e3: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 12
  }
};

const darkElevation: ElevationLevels = {
  e1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.28,
    shadowRadius: 2,
    elevation: 1
  },
  e2: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 4
  },
  e3: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.5,
    shadowRadius: 36,
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
