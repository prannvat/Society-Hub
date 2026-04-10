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
  input: 8,
  card: 12,
  pill: 100
};

const lightColors = {
  primary: '#000000',
  secondary: '#737373',
  accent: '#000000',
  background: '#F4F4F5',
  surface: 'rgba(255, 255, 255, 0.7)',
  textPrimary: '#18181B',
  textSecondary: '#71717A',
  border: 'rgba(0, 0, 0, 0.08)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

const darkColors = {
  primary: '#FFFFFF',
  secondary: '#A1A1AA',
  accent: '#FFFFFF',
  background: '#000000',
  surface: 'rgba(24, 24, 27, 0.7)',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: 'rgba(255, 255, 255, 0.12)',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F87171'
};

export const getTheme = (mode: ThemeMode) => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  spacing,
  radius,
  typography: {
    heading: societyConfig.fonts.heading,
    body: societyConfig.fonts.body
  },
  shadow: {
    shadowColor: mode === 'dark' ? '#000000' : '#64748B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: mode === 'dark' ? 0.6 : 0.08,
    shadowRadius: 24,
    elevation: mode === 'dark' ? 8 : 4
  }
});

export type AppTheme = ReturnType<typeof getTheme>;
