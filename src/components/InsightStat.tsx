import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type InsightStatProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
  caption?: string;
};

/**
 * Compact engagement tile — a sunken, borderless cousin of StatCard used inside
 * an EngagementCard grid. Shows one honest, derived metric with a caption that
 * says exactly what it counts (no trends, no invented reach numbers).
 */
export const InsightStat = ({ icon, value, label, caption }: InsightStatProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: theme.colors.surfaceSunken,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[styles.iconBox, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.sm }]}
        >
          <MaterialIcons name={icon} size={16} color={theme.colors.primary} />
        </View>
        <Text style={[theme.typography.micro, { color: theme.colors.textTertiary, flex: 1 }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={[theme.typography.h2, styles.value, { color: theme.colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      {caption ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: 2,
  },
});
