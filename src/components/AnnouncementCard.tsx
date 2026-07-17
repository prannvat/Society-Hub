import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementItem } from '@/types';
import { BadgeChip, BadgeChipVariant } from './BadgeChip';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type AnnouncementCardProps = {
  item: AnnouncementItem;
  onPress?: (item: AnnouncementItem) => void;
};

export const categoryChipVariant = (category: string): BadgeChipVariant => {
  switch (category.toUpperCase()) {
    case 'IMPORTANT':
      return 'danger';
    case 'EVENTS':
      return 'primary';
    case 'COMMITTEE':
      return 'warning';
    default:
      return 'neutral';
  }
};

export const formatRelativeTime = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  if (diffMs < 0) {
    return value;
  }
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(parsed);
  startOfDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startOfToday.getTime() - startOfDay.getTime()) / 86400000);
  if (dayDiff === 0) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }
  if (dayDiff === 1) {
    return 'Yesterday';
  }
  if (dayDiff < 7) {
    return `${dayDiff}d ago`;
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const AnnouncementCard = ({ item, onPress }: AnnouncementCardProps) => {
  const theme = useAppTheme();

  return (
    <Card onPress={onPress ? () => onPress(item) : undefined}>
      <View style={styles.headerRow}>
        <BadgeChip label={item.category} variant={categoryChipVariant(item.category)} />
        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
          {formatRelativeTime(item.timestamp)}
        </Text>
      </View>
      <Text style={[theme.typography.h3, styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.preview}
      </Text>
      <View style={styles.authorRow}>
        <MaterialIcons name="person-outline" size={14} color={theme.colors.textTertiary} />
        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, flexShrink: 1 }]} numberOfLines={1}>
          {item.authorName}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  title: {
    marginTop: 10
  },
  authorRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  }
});
