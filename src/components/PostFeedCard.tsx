import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { FeedPostShell } from './FeedPostShell';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { categoryChipVariant } from './AnnouncementCard';
import { PostActionBar } from './PostActionBar';
import { ContentOwnerMenu } from './ContentOwnerMenu';
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
  imageUrl?: string;
  onOpenSociety: () => void;
  onReadMore: () => void;
  // Post interactions. Optional so the card stays usable in surfaces that don't
  // (yet) thread interaction data; the action bar renders only when we have a
  // post id to act on.
  postId?: string;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  /** Committee affordances — only rendered when the viewer can manage this post. */
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const PostFeedCard = ({
  society,
  createdAtIso,
  title,
  preview,
  body,
  category,
  imageUrl,
  onOpenSociety,
  onReadMore,
  postId,
  likeCount = 0,
  commentCount = 0,
  likedByMe = false,
  canManage = false,
  onEdit,
  onDelete
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
        trailing={
          <View style={styles.headerTrailing}>
            <BadgeChip label={category} variant={categoryChipVariant(category)} />
            <ContentOwnerMenu
              noun="post"
              visible={canManage && Boolean(onDelete)}
              onEdit={onEdit}
              onDelete={() => onDelete?.()}
            />
          </View>
        }
      />

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { backgroundColor: theme.colors.surfaceSunken }]}
          resizeMode="cover"
        />
      ) : null}

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
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  // Edge-to-edge, cancelling the shell's 16px horizontal padding.
  image: {
    height: 320,
    marginTop: 12,
    marginHorizontal: -16
  },
  content: {
    marginTop: 12
  },
  more: {
    marginTop: 2
  }
});
