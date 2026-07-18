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
import { fetchMemberships } from '@/services/api/memberships';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';

type CommentsSheetProps = {
  announcementId: string | null;
  visible: boolean;
  onClose: () => void;
};

type ReplyTarget = { rootId: string; name: string };
type MentionMember = { id: string; fullName: string; avatarUrl?: string | null };
type Thread = { comment: ApiComment; replies: ApiComment[] };

// Matches a trailing `@query` the user is actively typing (no space yet), which
// drives the mention autocomplete. Empty query (just typed `@`) still matches.
const MENTION_QUERY_RE = /@([A-Za-z]*)$/;

/**
 * Instagram-style comments: a draggable bottom sheet. Opens at ~half height and
 * can be pulled up to full (or flicked down to dismiss), with a pill composer.
 * Supports one level of threaded replies and @mention autocomplete.
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
  const inputRef = React.useRef<TextInput>(null);

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
  const [replyTarget, setReplyTarget] = React.useState<ReplyTarget | null>(null);
  const [members, setMembers] = React.useState<MentionMember[]>([]);
  // Members inserted via the @mention autocomplete this composing session. On send
  // we keep only those whose `@FullName` still survives in the body.
  const [insertedMentions, setInsertedMentions] = React.useState<MentionMember[]>([]);

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
    setReplyTarget(null);
    setInsertedMentions([]);
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

  // Load society members once per open, purely to power @mention autocomplete.
  // Missing societyId or a failed fetch degrades silently — replies + highlight
  // still work, typing `@` just stays plain text.
  React.useEffect(() => {
    if (!visible || !societyId) {
      setMembers([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const result = await fetchMemberships(societyId);
        if (!active) return;
        setMembers(
          result
            .map((m) => m.user)
            .filter((u): u is NonNullable<typeof u> => Boolean(u))
            .map((u) => ({ id: u.id, fullName: u.fullName, avatarUrl: u.avatarUrl })),
        );
      } catch {
        if (active) setMembers([]);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, societyId]);

  // Group the flat list into top-level comments + their replies, preserving the
  // API's createdAt order (new comments are appended, so array order is stable).
  const threads = React.useMemo<Thread[]>(() => {
    const repliesByRoot = new Map<string, ApiComment[]>();
    for (const c of comments) {
      if (c.parentId) {
        const arr = repliesByRoot.get(c.parentId) ?? [];
        arr.push(c);
        repliesByRoot.set(c.parentId, arr);
      }
    }
    return comments
      .filter((c) => !c.parentId)
      .map((comment) => ({ comment, replies: repliesByRoot.get(comment.id) ?? [] }));
  }, [comments]);

  // Active `@query` at the end of the draft → matching members (max 5).
  const mentionMatches = React.useMemo<MentionMember[]>(() => {
    if (members.length === 0) return [];
    const match = MENTION_QUERY_RE.exec(draft);
    if (!match) return [];
    const query = match[1].toLowerCase();
    return members.filter((m) => (query ? m.fullName.toLowerCase().includes(query) : true)).slice(0, 5);
  }, [draft, members]);

  const startReply = (rootId: string, name: string) => {
    setReplyTarget({ rootId, name });
    setDraft(`@${name} `);
    animateTo(FULL_TOP);
    // Focus after the sheet begins expanding so the keyboard rises into view.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const applyMention = (member: MentionMember) => {
    setDraft((prev) => prev.replace(MENTION_QUERY_RE, `@${member.fullName} `));
    setInsertedMentions((prev) => (prev.some((m) => m.id === member.id) ? prev : [...prev, member]));
    inputRef.current?.focus();
  };

  const onSend = async () => {
    const body = draft.trim();
    if (!body || sending || !announcementId) return;
    setSending(true);
    // Resolve mention ids by matching still-present `@FullName` tokens against the
    // members inserted from autocomplete (deduped). Robust to edits/deletions.
    const mentionedUserIds = Array.from(
      new Set(insertedMentions.filter((m) => body.includes(`@${m.fullName}`)).map((m) => m.id)),
    );
    try {
      const created = await addComment(
        announcementId,
        body,
        replyTarget?.rootId,
        mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      );
      setComments((prev) => [...prev, created]);
      setDraft('');
      setReplyTarget(null);
      setInsertedMentions([]);
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
            ) : threads.length === 0 ? (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon="chat-bubble-outline"
                  title="No comments yet"
                  subtitle="Start the conversation and be the first to comment."
                />
              </View>
            ) : (
              <FlatList
                data={threads}
                keyExtractor={(item) => item.comment.id}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View>
                    <CommentRow
                      comment={item.comment}
                      canDelete={item.comment.user.id === currentUserId || canModerate}
                      onDelete={() => onDelete(item.comment)}
                      onReply={() => startReply(item.comment.id, item.comment.user.fullName)}
                    />
                    {item.replies.length > 0 ? (
                      <View style={[styles.replies, { borderLeftColor: theme.colors.border }]}>
                        {item.replies.map((reply) => (
                          <CommentRow
                            key={reply.id}
                            comment={reply}
                            isReply
                            canDelete={reply.user.id === currentUserId || canModerate}
                            onDelete={() => onDelete(reply)}
                            onReply={() => startReply(reply.parentId ?? item.comment.id, reply.user.fullName)}
                          />
                        ))}
                      </View>
                    ) : null}
                  </View>
                )}
              />
            )}

            {/* Composer stack: autocomplete → reply chip → pill row */}
            <View
              style={[
                styles.composer,
                { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceElevated, paddingBottom: Math.max(insets.bottom, 10) },
              ]}
            >
              {mentionMatches.length > 0 ? (
                <View style={[styles.mentionList, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border, borderRadius: theme.radius.lg }]}>
                  {mentionMatches.map((member) => (
                    <Pressable
                      key={member.id}
                      onPress={() => applyMention(member)}
                      style={({ pressed }) => [styles.mentionItem, { opacity: pressed ? 0.6 : 1 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Mention ${member.fullName}`}
                    >
                      <Avatar name={member.fullName} url={member.avatarUrl ?? undefined} size={28} />
                      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {member.fullName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {replyTarget ? (
                <View style={[styles.replyChip, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill }]}>
                  <Text style={[theme.typography.caption, styles.replyChipText, { color: theme.colors.primary }]} numberOfLines={1}>
                    Replying to @{replyTarget.name}
                  </Text>
                  <Pressable onPress={() => setReplyTarget(null)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel reply">
                    <MaterialIcons name="close" size={16} color={theme.colors.primary} />
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.composerRow}>
                <Avatar name={profile.fullName || 'You'} url={profile.avatarUrl} size={32} />
                <View style={[styles.pill, { backgroundColor: theme.colors.surfaceSunken, borderColor: theme.colors.border, borderRadius: theme.radius.pill }]}>
                  <TextInput
                    ref={inputRef}
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
  replies: { marginLeft: 18, paddingLeft: spacing.md, borderLeftWidth: StyleSheet.hairlineWidth },
  composer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  mentionList: { borderWidth: 1, overflow: 'hidden' },
  mentionItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12, paddingVertical: 8, minHeight: 44 },
  replyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  replyChipText: { flexShrink: 1 },
  pill: { flex: 1, borderWidth: 1, paddingHorizontal: 14, justifyContent: 'center', minHeight: 40, maxHeight: 120 },
  input: { ...Platform.select({ ios: { paddingTop: 10, paddingBottom: 10 }, default: {} }), fontSize: 15, maxHeight: 100 },
  send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
});
