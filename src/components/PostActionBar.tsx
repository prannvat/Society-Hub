import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { likeAnnouncement, unlikeAnnouncement } from '@/services/api/announcements';
import { useToast } from './Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { haptics } from '@/utils/haptics';

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
  const heartScale = useRef(new Animated.Value(1)).current;

  // Instagram's heart "pop": a quick overshoot then settle. Native-driven so it
  // stays smooth regardless of JS work.
  const popHeart = () => {
    heartScale.setValue(0.8);
    Animated.spring(heartScale, {
      toValue: 1,
      friction: 3,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const onToggleLike = async () => {
    if (pending) {
      return;
    }
    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !prevLiked;

    // Optimistic flip, with a tactile tick and a pop when the heart fills.
    haptics.tap();
    if (nextLiked) {
      popHeart();
    }
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
    <View>
      <View style={styles.row}>
        <Pressable
          onPress={onToggleLike}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <MaterialIcons
              name={liked ? 'favorite' : 'favorite-border'}
              size={26}
              color={liked ? theme.colors.danger : theme.colors.textPrimary}
            />
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={onOpenComments}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View comments"
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}
        >
          <MaterialIcons name="chat-bubble-outline" size={24} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      {count > 0 ? (
        <Text style={[theme.typography.bodyMedium, styles.likes, { color: theme.colors.textPrimary }]}>
          {count} {count === 1 ? 'like' : 'likes'}
        </Text>
      ) : null}

      {commentCount > 0 ? (
        <Text
          onPress={onOpenComments}
          suppressHighlighting
          style={[theme.typography.body, styles.comments, { color: theme.colors.textTertiary }]}
        >
          View all {commentCount} comments
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10
  },
  action: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10
  },
  likes: {
    marginTop: 2
  },
  comments: {
    marginTop: 3
  }
});
