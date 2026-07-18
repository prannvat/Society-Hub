import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ApiComment } from '@/services/api/announcements';
import { formatRelativeTime } from './AnnouncementCard';
import { Avatar } from './Avatar';
import { useAppTheme } from '@/hooks/useAppTheme';

type CommentRowProps = {
  comment: ApiComment;
  canDelete: boolean;
  onDelete: () => void;
};

/**
 * A single comment: author avatar, name, body, and a relative timestamp. When the
 * viewer is allowed to remove it (their own comment, or they moderate the society)
 * a long-press surfaces the delete flow the parent screen owns.
 */
export const CommentRow = ({ comment, canDelete, onDelete }: CommentRowProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onLongPress={canDelete ? onDelete : undefined}
      delayLongPress={280}
      style={({ pressed }) => [styles.row, { opacity: pressed && canDelete ? 0.7 : 1 }]}
    >
      <Avatar name={comment.user.fullName} url={comment.user.avatarUrl ?? undefined} size={36} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
            {comment.user.fullName}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{comment.body}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10
  },
  body: {
    flex: 1,
    gap: 3
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  }
});
