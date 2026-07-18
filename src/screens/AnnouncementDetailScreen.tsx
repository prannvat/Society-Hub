import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { categoryChipVariant, formatRelativeTime } from '@/components/AnnouncementCard';
import { Card } from '@/components/Card';
import { CommentRow } from '@/components/CommentRow';
import { InputField } from '@/components/InputField';
import { PostActionBar } from '@/components/PostActionBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useComments } from '@/hooks/useComments';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addComment, ApiComment, fetchAnnouncementDetail, fetchComments } from '@/services/api';

export const AnnouncementDetailScreen = () => {
  const theme = useAppTheme();
  const { openComments } = useComments();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AnnouncementDetail'>>();
  const toast = useToast();
  const { announcements, currentUserId } = useLocalAppState();
  const { adminSocieties } = useUserRoles();
  const [remoteBody, setRemoteBody] = React.useState<string | null>(null);
  const [remoteAuthor, setRemoteAuthor] = React.useState<string | null>(null);
  const [comments, setComments] = React.useState<ApiComment[]>([]);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const announcement = announcements.find((entry) => entry.id === route.params?.announcementId) ?? announcements[0];
  const announcementId = route.params?.announcementId ?? announcement?.id ?? '';

  React.useEffect(() => {
    if (!announcementId) {
      return;
    }

    (async () => {
      try {
        const detail = await fetchAnnouncementDetail(announcementId);
        setRemoteBody(detail.body ?? null);
        setRemoteAuthor(detail.createdBy?.fullName ?? null);
      } catch {
        setRemoteBody(null);
        setRemoteAuthor(null);
      }
    })();
  }, [announcementId]);

  React.useEffect(() => {
    if (!announcementId) {
      return;
    }
    let active = true;
    (async () => {
      try {
        const result = await fetchComments(announcementId);
        if (active) {
          setComments(result);
        }
      } catch {
        // Comments are supplementary here — stay silent, the thread screen surfaces load errors.
      }
    })();
    return () => {
      active = false;
    };
  }, [announcementId]);

  const onSendComment = async () => {
    const bodyText = draft.trim();
    if (!bodyText || sending) {
      return;
    }
    setSending(true);
    try {
      const created = await addComment(announcementId, bodyText);
      setComments((prev: ApiComment[]) => [...prev, created]);
      setDraft('');
    } catch {
      toast.show('Could not post your comment', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!announcement) {
    return (
      <ScreenLayout scroll={false}>
        <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Announcement not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  const body = remoteBody ?? announcement.body ?? announcement.preview;
  const hasFullBody = Boolean(remoteBody || announcement.body);
  const canModerate = announcement.societyId
    ? adminSocieties.some(
        (society) =>
          society.societyId === announcement.societyId &&
          (society.role === 'Committee' || society.role === 'President')
      )
    : false;
  const previewComments = comments.slice(0, 3);
  const totalComments = Math.max(comments.length, announcement.commentCount ?? 0);

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category + metadata */}
        <View style={styles.metaRow}>
          <BadgeChip label={announcement.category} variant={categoryChipVariant(announcement.category)} />
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {formatRelativeTime(announcement.timestamp)}
          </Text>
        </View>

        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>{announcement.title}</Text>

        <View style={styles.bylineRow}>
          <MaterialIcons name="person-outline" size={15} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
            {remoteAuthor ?? announcement.authorName}
          </Text>
          <View style={[styles.bylineDot, { backgroundColor: theme.colors.textTertiary }]} />
          <MaterialIcons name="visibility" size={15} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {announcement.readCount} reads
          </Text>
        </View>

        <Card>
          <Text style={[theme.typography.body, styles.bodyText, { color: theme.colors.textPrimary }]}>{body}</Text>
          {!hasFullBody && (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Full announcement details are not available for this entry yet.
            </Text>
          )}
          <PostActionBar
            postId={announcement.id}
            likeCount={announcement.likeCount ?? 0}
            commentCount={announcement.commentCount ?? 0}
            likedByMe={announcement.likedByMe ?? false}
            onOpenComments={() => openComments(announcementId)}
          />
        </Card>

        {/* Comments preview + inline composer */}
        <View style={styles.commentsSection}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Comments</Text>

          {previewComments.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              No comments yet — start the conversation.
            </Text>
          ) : (
            previewComments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                canDelete={comment.user.id === currentUserId || canModerate}
                onDelete={() => openComments(announcementId)}
              />
            ))
          )}

          {totalComments > previewComments.length ? (
            <Text
              onPress={() => openComments(announcementId)}
              style={[theme.typography.captionMedium, styles.viewAll, { color: theme.colors.primary }]}
            >
              View all {totalComments} comments
            </Text>
          ) : null}

          <View style={styles.composerRow}>
            <View style={styles.composerInput}>
              <InputField
                placeholder="Add a comment…"
                value={draft}
                onChangeText={setDraft}
                autoCapitalize="sentences"
                multiline
              />
            </View>
            <PrimaryButton
              label="Send"
              size="md"
              icon="send"
              onPress={onSendComment}
              loading={sending}
              disabled={draft.trim().length === 0}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  bylineDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 3
  },
  bodyText: {
    lineHeight: 24
  },
  commentsSection: {
    gap: 8
  },
  viewAll: {
    marginTop: 2
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 4
  },
  composerInput: {
    flex: 1
  }
});
