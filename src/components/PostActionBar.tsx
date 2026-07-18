import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { likeAnnouncement, unlikeAnnouncement } from '@/services/api/announcements';
import { useToast } from './Toast';
import { useAppTheme } from '@/hooks/useAppTheme';

type PostActionBarProps = {
  postId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  onOpenComments: () => void;
};

/**
 * Instagram-style action row for a post: a Like toggle (heart + count) and a
 * Comment shortcut (chat bubble + count). The like is optimistic — the heart and
 * count flip instantly, the network call runs in the background, and a failure
 * reverts to the pre-tap state with a toast. Comment count is display-only; the
 * count is owned by whoever renders the thread.
 */
export const PostActionBar = ({ postId, likeCount, commentCount, likedByMe, onOpenComments }: PostActionBarProps) => {
  const theme = useAppTheme();
  const toast = useToast();
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [pending, setPending] = useState(false);

  const onToggleLike = async () => {
    if (pending) {
      return;
    }
    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;

    // Optimistic flip.
    setLiked(nextLiked);
    setCount(prevCount + (nextLiked ? 1 : -1));
    setPending(true);

    try {
      const result = nextLiked ? await likeAnnouncement(postId) : await unlikeAnnouncement(postId);
      // Reconcile with the server's authoritative values.
      setLiked(result.liked);
      setCount(result.likeCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      toast.show(nextLiked ? 'Could not like this post' : 'Could not remove your like', 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={[styles.row, { borderTopColor: theme.colors.border }]}>
      <Pressable
        onPress={onToggleLike}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
      >
        <MaterialIcons
          name={liked ? 'favorite' : 'favorite-border'}
          size={22}
          color={liked ? theme.colors.danger : theme.colors.textSecondary}
        />
        {count > 0 ? (
          <Text
            style={[
              theme.typography.captionMedium,
              { color: liked ? theme.colors.danger : theme.colors.textSecondary }
            ]}
          >
            {count}
          </Text>
        ) : null}
      </Pressable>

      <Pressable
        onPress={onOpenComments}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="View comments"
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
      >
        <MaterialIcons name="chat-bubble-outline" size={20} color={theme.colors.textSecondary} />
        {commentCount > 0 ? (
          <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>{commentCount}</Text>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  action: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 12
  }
});
