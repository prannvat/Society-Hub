import { Platform } from 'react-native';
import { StyleSheet } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { AppTheme } from '@/config/theme';

/**
 * Shared screen options for all bottom tab navigators (consumer, society admin).
 * Per-navigator options (like tabBarIcon) are spread on top of this.
 */
export const getTabNavigatorOptions = (theme: AppTheme): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: true,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarStyle: {
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    backgroundColor: theme.colors.tabBarBackground,
    borderTopColor: theme.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0
  },
  tabBarItemStyle: {
    paddingVertical: 2
  },
  tabBarLabelStyle: {
    ...theme.typography.captionMedium,
    fontSize: 11,
    lineHeight: 14
  }
});
