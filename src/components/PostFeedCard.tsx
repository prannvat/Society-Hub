import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FeedPostShell } from './FeedPostShell';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { categoryChipVariant } from './AnnouncementCard';
import { PostActionBar } from './PostActionBar';
import { FeedSociety } from '@/hooks/useFeed';
import { AnnouncementCategory } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useComments } from '@/hooks/useComments';

type PostFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  title: string;
  preview: string;
  body?: string;
  category: AnnouncementCategory;
  onOpenSociety: () => void;
  onReadMore: () => void;
  // Post interactions. Optional so the card stays usable in surfaces that don't
  // (yet) thread interaction data; the action bar renders only when we have a
  // post id to act on.
  postId?: string;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
};

export const PostFeedCard = ({
  society,
  createdAtIso,
  title,
  preview,
  body,
  category,
  onOpenSociety,
  onReadMore,
  postId,
  likeCount = 0,
  commentCount = 0,
  likedByMe = false
}: PostFeedCardProps) => {
  const theme = useAppTheme();
  const { openComments } = useComments();
  const content = (body?.trim() || preview || '').trim();
  const isClamped = content.length > 180;

  return (
    <FeedPostShell>
      <FeedCardHeader
        society={society}
        createdAtIso={createdAtIso}
        onPressSociety={onOpenSociety}
        trailing={<BadgeChip label={category} variant={categoryChipVariant(category)} />}
      />

      {/* The post itself. Tapping the text opens the full detail view. */}
      <Text onPress={onReadMore} suppressHighlighting style={styles.content}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{title}</Text>
        {content ? (
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
            {'\n'}
            {content}
          </Text>
        ) : null}
      </Text>

      {isClamped ? (
        <Text
          onPress={onReadMore}
          suppressHighlighting
          style={[theme.typography.body, styles.more, { color: theme.colors.textTertiary }]}
        >
          more
        </Text>
      ) : null}

      {postId ? (
        <PostActionBar
          postId={postId}
          likeCount={likeCount}
          commentCount={commentCount}
          likedByMe={likedByMe}
          onOpenComments={() => openComments(postId)}
        />
      ) : null}
    </FeedPostShell>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 10
  },
  more: {
    marginTop: 2
  }
});
