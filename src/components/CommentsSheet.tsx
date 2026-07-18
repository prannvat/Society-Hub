import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { CommentRow } from '@/components/CommentRow';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { addComment, ApiComment, deleteComment, fetchComments } from '@/services/api/announcements';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';

type CommentsSheetProps = {
  announcementId: string | null;
  visible: boolean;
  onClose: () => void;
};

/**
 * Instagram-style comments: a draggable bottom sheet. Opens at ~half height and
 * can be pulled up to full (or flicked down to dismiss), with a pill composer.
 */
export const CommentsSheet = ({ announcementId, visible, onClose }: CommentsSheetProps) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { height: SCREEN_H } = useWindowDimensions();
  const { currentUserId, profile, announcements } = useLocalAppState();
  const { adminSocieties } = useUserRoles();

  // Snap points expressed as the sheet's TOP offset (smaller = taller sheet).
  const FULL_TOP = Math.max(insets.top + 8, 48);
  const HALF_TOP = Math.round(SCREEN_H * 0.5);
  const CLOSED_TOP = SCREEN_H;

  const topAnim = React.useRef(new Animated.Value(CLOSED_TOP)).current;
  const currentTop = React.useRef(CLOSED_TOP);
  const gestureStartTop = React.useRef(CLOSED_TOP);

  const animateTo = React.useCallback(
    (to: number) => {
      currentTop.current = to;
      Animated.timing(topAnim, { toValue: to, duration: 240, useNativeDriver: false }).start();
    },
    [topAnim],
  );

  const close = React.useCallback(() => {
    currentTop.current = CLOSED_TOP;
    Animated.timing(topAnim, { toValue: CLOSED_TOP, duration: 200, useNativeDriver: false }).start(() => onClose());
  }, [CLOSED_TOP, topAnim, onClose]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        gestureStartTop.current = currentTop.current;
      },
      onPanResponderMove: (_e, g) => {
        const next = Math.min(Math.max(gestureStartTop.current + g.dy, FULL_TOP), CLOSED_TOP);
        topAnim.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        const endTop = Math.min(Math.max(gestureStartTop.current + g.dy, FULL_TOP), CLOSED_TOP);
        if (g.vy > 1.2 || endTop > SCREEN_H * 0.72) {
          close();
        } else if (g.vy < -0.4 || endTop < (FULL_TOP + HALF_TOP) / 2) {
          animateTo(FULL_TOP);
        } else {
          animateTo(HALF_TOP);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

  const [comments, setComments] = React.useState<ApiComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const societyId = announcements.find((a) => a.id === announcementId)?.societyId ?? null;
  const canModerate = societyId
    ? adminSocieties.some((s) => s.societyId === societyId && (s.role === 'Committee' || s.role === 'President'))
    : false;

  React.useEffect(() => {
    if (visible) {
      animateTo(HALF_TOP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  React.useEffect(() => {
    if (!visible || !announcementId) return;
    let active = true;
    setLoading(true);
    setDraft('');
    (async () => {
      try {
        const result = await fetchComments(announcementId);
        if (active) setComments(result);
      } catch {
        if (active) toast.show('Could not load comments', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, announcementId]);

  const onSend = async () => {
    const body = draft.trim();
    if (!body || sending || !announcementId) return;
    setSending(true);
    try {
      const created = await addComment(announcementId, body);
      setComments((prev) => [...prev, created]);
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
          setComments((prev) => prev.filter((c) => c.id !== comment.id));
          try {
            await deleteComment(announcementId!, comment.id);
            toast.show('Comment deleted', 'success');
          } catch {
            setComments(previous);
            toast.show('Could not delete comment', 'error');
          }
        },
      },
    ]);
  };

  const canSend = draft.trim().length > 0 && !sending;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.fill}>
        <Pressable style={[styles.scrim, { backgroundColor: theme.colors.overlay }]} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            {
              top: topAnim,
              backgroundColor: theme.colors.surfaceElevated,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            },
            theme.elevation.e3,
          ]}
        >
          {/* Grabber + title — drag target */}
          <View {...panResponder.panHandlers} style={styles.grabArea}>
            <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />
            <Text style={[theme.typography.h3, styles.title, { color: theme.colors.textPrimary }]}>Comments</Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          <KeyboardAvoidingView
            style={styles.body}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          >
            {loading ? (
              <View style={styles.listContent}>
                {[0, 1, 2].map((k) => (
                  <View key={k} style={styles.skeletonRow}>
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

            {/* Compact pill composer */}
            <View
              style={[
                styles.composer,
                { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated, paddingBottom: Math.max(insets.bottom, 10) },
              ]}
            >
              <Avatar name={profile.fullName || 'You'} url={profile.avatarUrl} size={32} />
              <View style={[styles.pill, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}>
                <TextInput
                  style={[styles.input, { color: theme.colors.textPrimary }]}
                  placeholder="Add a comment…"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={draft}
                  onChangeText={setDraft}
                  autoCapitalize="sentences"
                  multiline
                  onFocus={() => animateTo(FULL_TOP)}
                  onSubmitEditing={onSend}
                  returnKeyType="send"
                />
              </View>
              <Pressable
                onPress={onSend}
                disabled={!canSend}
                hitSlop={8}
                style={[styles.send, { backgroundColor: canSend ? theme.colors.primary : theme.colors.surfaceSunken, opacity: canSend ? 1 : 0.6 }]}
                accessibilityRole="button"
                accessibilityLabel="Post comment"
              >
                {sending ? (
                  <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
                ) : (
                  <MaterialIcons name="arrow-upward" size={20} color={canSend ? theme.colors.textOnPrimary : theme.colors.textTertiary} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  grabArea: { paddingTop: spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.sm },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth },
  body: { flex: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  skeletonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: 10 },
  skeletonBody: { flex: 1, gap: 8, paddingTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pill: { flex: 1, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center', minHeight: 40, maxHeight: 120 },
  input: { ...Platform.select({ ios: { paddingTop: 10, paddingBottom: 10 }, default: {} }), fontSize: 15, maxHeight: 100 },
  send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
