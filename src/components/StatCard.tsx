import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export const StatCard = ({ label, value, hint, trend, icon }: StatCardProps) => {
  const theme = useAppTheme();

  const trendColor =
    trend === 'up' ? theme.colors.success : trend === 'down' ? theme.colors.danger : theme.colors.textTertiary;
  const trendIcon: keyof typeof MaterialIcons.glyphMap =
    trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat';

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary, flex: 1 }]} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}>
            <MaterialIcons name={icon} size={16} color={theme.colors.primary} />
          </View>
        ) : null}
      </View>
      <Text style={[theme.typography.h1, styles.value, { color: theme.colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {hint || trend ? (
        <View style={styles.hintRow}>
          {trend ? <MaterialIcons name={trendIcon} size={14} color={trendColor} /> : null}
          {hint ? (
            <Text style={[theme.typography.caption, { color: trend ? trendColor : theme.colors.textSecondary }]} numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBox: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center'
  },
  value: {
    marginTop: 6
  },
  hintRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  }
});
