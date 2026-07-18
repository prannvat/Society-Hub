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
  onReply?: () => void;
  isReply?: boolean;
};

// Highlights `@Name` mentions: a mention is `@` + a word, optionally followed by
// further Capitalized words (so "@Jane Doe" both highlight, but "@Jane how are you"
// only lights up "Jane"). Deliberately light — legible without a parser.
const MENTION_RE = /@[A-Za-z]+(?:\s[A-Z][A-Za-z]*)*/g;

type Segment = { text: string; mention: boolean };

const splitMentions = (body: string): Segment[] => {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((match = MENTION_RE.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: body.slice(lastIndex, match.index), mention: false });
    }
    segments.push({ text: match[0], mention: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    segments.push({ text: body.slice(lastIndex), mention: false });
  }
  return segments;
};

/**
 * A single comment: author avatar, name, body (with highlighted @mentions), a
 * relative timestamp, and a Reply action. Replies render at `isReply` scale
 * (smaller avatar) beneath their parent. When the viewer may remove it (their own
 * comment, or they moderate the society) a long-press surfaces the delete flow.
 */
export const CommentRow = ({ comment, canDelete, onDelete, onReply, isReply = false }: CommentRowProps) => {
  const theme = useAppTheme();
  const segments = splitMentions(comment.body);
  const avatarSize = isReply ? 28 : 36;

  return (
    <Pressable
      onLongPress={canDelete ? onDelete : undefined}
      delayLongPress={280}
      style={({ pressed }) => [styles.row, { opacity: pressed && canDelete ? 0.7 : 1 }]}
    >
      <Avatar name={comment.user.fullName} url={comment.user.avatarUrl ?? undefined} size={avatarSize} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={1}>
            {comment.user.fullName}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {formatRelativeTime(comment.createdAt)}
          </Text>
        </View>
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
          {segments.map((segment, index) =>
            segment.mention ? (
              <Text key={index} style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {segment.text}
              </Text>
            ) : (
              segment.text
            ),
          )}
        </Text>
        {onReply ? (
          <Pressable onPress={onReply} hitSlop={10} style={styles.replyBtn} accessibilityRole="button" accessibilityLabel="Reply">
            <Text style={[theme.typography.captionMedium, { color: theme.colors.textTertiary }]}>Reply</Text>
          </Pressable>
        ) : null}
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
  },
  replyBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    minHeight: 24
  }
});
