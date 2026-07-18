import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from './Card';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { categoryChipVariant } from './AnnouncementCard';
import { PostActionBar } from './PostActionBar';
import { FeedSociety } from '@/hooks/useFeed';
import { AnnouncementCategory } from '@/types';
import { RootStackParamList } from '@/navigation/types';
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

      {postId ? (
        <PostActionBar
          postId={postId}
          likeCount={likeCount}
          commentCount={commentCount}
          likedByMe={likedByMe}
          onOpenComments={() => navigation.navigate('Comments', { announcementId: postId })}
        />
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
