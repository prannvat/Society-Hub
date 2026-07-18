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
  // Instagram tab bar: icon-only, and the active icon is black (textPrimary),
  // not a colour — the accent blue is reserved for actions, never navigation.
  tabBarShowLabel: false,
  tabBarActiveTintColor: theme.colors.textPrimary,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarStyle: {
    height: Platform.OS === 'ios' ? 82 : 60,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 10,
    backgroundColor: theme.colors.tabBarBackground,
    borderTopColor: theme.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0
  },
  tabBarItemStyle: {
    paddingVertical: 0
  }
});
