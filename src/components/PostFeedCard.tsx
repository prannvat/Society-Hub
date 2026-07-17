import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { categoryChipVariant } from './AnnouncementCard';
import { FeedSociety } from '@/hooks/useFeed';
import { AnnouncementCategory } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

type PostFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  title: string;
  preview: string;
  body?: string;
  category: AnnouncementCategory;
  onOpenSociety: () => void;
  onReadMore: () => void;
};

export const PostFeedCard = ({
  society,
  createdAtIso,
  title,
  preview,
  body,
  category,
  onOpenSociety,
  onReadMore
}: PostFeedCardProps) => {
  const theme = useAppTheme();
  const content = (body?.trim() || preview || '').trim();
  const isClamped = content.length > 180;

  return (
    <Card onPress={onReadMore}>
      <FeedCardHeader
        society={society}
        createdAtIso={createdAtIso}
        onPressSociety={onOpenSociety}
        trailing={<BadgeChip label={category} variant={categoryChipVariant(category)} />}
      />

      <Text style={[theme.typography.h3, styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {title}
      </Text>

      {content ? (
        <Text style={[theme.typography.body, styles.body, { color: theme.colors.textSecondary }]} numberOfLines={4}>
          {content}
        </Text>
      ) : null}

      {isClamped ? (
        <View style={styles.readMoreRow}>
          <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>Read more</Text>
          <MaterialIcons name="arrow-forward" size={14} color={theme.colors.primary} />
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 12
  },
  body: {
    marginTop: 6
  },
  readMoreRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  }
});
