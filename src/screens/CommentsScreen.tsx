import React from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommentRow } from '@/components/CommentRow';
import { EmptyState } from '@/components/EmptyState';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Skeleton } from '@/components/Skeleton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { addComment, ApiComment, deleteComment, fetchComments } from '@/services/api/announcements';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';

export const CommentsScreen = () => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Comments'>>();
  const announcementId = route.params?.announcementId ?? '';

  const { currentUserId, announcements } = useLocalAppState();
  const { adminSocieties } = useUserRoles();

  const [comments, setComments] = React.useState<ApiComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);

  // Whoever runs the post's society can moderate any comment on it. If we can't
  // resolve the society (announcement not in local state), fall back to
  // own-comment-only deletion.
  const societyId = announcements.find((entry) => entry.id === announcementId)?.societyId ?? null;
  const canModerate = societyId
    ? adminSocieties.some(
        (society) => society.societyId === societyId && (society.role === 'Committee' || society.role === 'President')
      )
    : false;

  React.useEffect(() => {
    if (!announcementId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const result = await fetchComments(announcementId);
        if (active) {
          setComments(result);
        }
      } catch {
        if (active) {
          toast.show('Could not load comments', 'error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);

  const onSend = async () => {
    const body = draft.trim();
    if (!body || sending) {
      return;
    }
    setSending(true);
    try {
      const created = await addComment(announcementId, body);
      setComments((prev: ApiComment[]) => [...prev, created]);
      setDraft('');
    } catch {
      toast.show('Could not post your comment', 'error');
    } finally {
      setSending(false);
    }
  };

  const onDelete = (comment: ApiComment) => {
    Alert.alert('Delete comment', 'This comment will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const previous = comments;
          setComments((prev: ApiComment[]) => prev.filter((entry) => entry.id !== comment.id));
          try {
            await deleteComment(announcementId, comment.id);
            toast.show('Comment deleted', 'success');
          } catch {
            setComments(previous);
            toast.show('Could not delete comment', 'error');
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <TopNavBar title="Comments" onBack={() => navigation.goBack()} />
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          {loading ? (
            <View style={styles.listContent}>
              {[0, 1, 2, 3].map((key) => (
                <View key={key} style={styles.skeletonRow}>
                  <Skeleton width={36} height={36} circle />
                  <View style={styles.skeletonBody}>
                    <Skeleton width="40%" height={12} />
                    <Skeleton width="90%" height={12} />
                  </View>
                </View>
              ))}
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="chat-bubble-outline"
                title="No comments yet"
                subtitle="Start the conversation and be the first to comment."
              />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <CommentRow
                  comment={item}
                  canDelete={item.user.id === currentUserId || canModerate}
                  onDelete={() => onDelete(item)}
                />
              )}
            />
          )}

          <View
            style={[
              styles.composer,
              {
                borderTopColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                paddingBottom: Math.max(insets.bottom, 10)
              }
            ]}
          >
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
              onPress={onSend}
              loading={sending}
              disabled={draft.trim().length === 0}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safe: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center'
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10
  },
  skeletonBody: {
    flex: 1,
    gap: 8,
    paddingTop: 4
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  composerInput: {
    flex: 1
  }
});
