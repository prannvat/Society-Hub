import { Platform } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { AppTheme } from '@/config/theme';

/**
 * Shared screen options for all bottom tab navigators (consumer, admin, union admin).
 * Per-navigator options (like tabBarIcon) are spread on top of this.
 */
export const getTabNavigatorOptions = (theme: AppTheme): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: true,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textSecondary,
  tabBarStyle: {
    height: Platform.OS === 'ios' ? 82 : 68,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 8 : undefined
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '700'
  }
});
