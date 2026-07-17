import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type NotificationBadgeProps = {
  count: number;
};

export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  const theme = useAppTheme();

  if (count <= 0) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.danger }]}>
      <Text style={[styles.text, { color: theme.mode === 'dark' ? '#2B0A0A' : '#FFFFFF' }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false
  }
});
