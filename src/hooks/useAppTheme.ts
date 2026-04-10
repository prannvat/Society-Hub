import { useColorScheme } from 'react-native';
import { getTheme } from '@/config/theme';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const { themePreference } = useLocalAppState();

  if (themePreference === 'Light') {
    return getTheme('light');
  }

  if (themePreference === 'Dark') {
    return getTheme('dark');
  }

  return getTheme(systemScheme === 'dark' ? 'dark' : 'light');
};
