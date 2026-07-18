import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { formatRelativeTime } from '@/components/AnnouncementCard';
import { TopNavBar } from '@/components/TopNavBar';
import { AppTheme, spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/services/api/notifications';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Accent = 'primary' | 'danger' | 'success' | 'warning';
type TypeMeta = { icon: keyof typeof MaterialIcons.glyphMap; accent: Accent };

// Each notification type → a glyph + a semantic accent used for the type-icon
// fallback (when there's no actor avatar) and the unread dot.
const TYPE_META: Record<NotificationType, TypeMeta> = {
  COMMENT: { icon: 'chat-bubble-outline', accent: 'primary' },
  REPLY: { icon: 'reply', accent: 'primary' },
  MENTION: { icon: 'alternate-email', accent: 'primary' },
  LIKE: { icon: 'favorite', accent: 'danger' },
  NEW_POST: { icon: 'campaign', accent: 'primary' },
  NEW_EVENT: { icon: 'event', accent: 'primary' },
  NEW_POLL: { icon: 'how-to-vote', accent: 'primary' },
  MEMBERSHIP_APPROVED: { icon: 'check-circle', accent: 'success' },
  MEMBERSHIP_REJECTED: { icon: 'cancel', accent: 'danger' },
  COMMITTEE_APPROVED: { icon: 'check-circle', accent: 'success' },
  COMMITTEE_REJECTED: { icon: 'cancel', accent: 'danger' },
  SOCIETY_APPROVED: { icon: 'check-circle', accent: 'success' },
  SOCIETY_REJECTED: { icon: 'cancel', accent: 'danger' },
  SOCIETY_REVIEW: { icon: 'gavel', accent: 'warning' },
  COMMITTEE_REVIEW: { icon: 'rate-review', accent: 'warning' },
};

const accentColor = (theme: AppTheme, accent: Accent) => {
  switch (accent) {
    case 'danger':
      return { fg: theme.colors.danger, soft: theme.colors.dangerSoft };
    case 'success':
      return { fg: theme.colors.success, soft: theme.colors.successSoft };
    case 'warning':
      return { fg: theme.colors.warning, soft: theme.colors.warningSoft };
    default:
      return { fg: theme.colors.primary, soft: theme.colors.primarySoft };
  }
};

const NotificationRow = ({
  item,
  onPress,
}: {
  item: Notification;
  onPress: (item: Notification) => void;
}) => {
  const theme = useAppTheme();
  const meta = TYPE_META[item.type] ?? TYPE_META.COMMENT;
  const accent = accentColor(theme, meta.accent);

  return (
    <Pressable
      onPress={() => onPress(item)}
      android_ripple={{ color: theme.colors.surfaceSunken }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: item.read
            ? theme.colors.surface
            : theme.colors.primarySoft,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {item.actor ? (
        <Avatar name={item.actor.fullName} url={item.actor.avatarUrl ?? undefined} size={44} />
      ) : (
        <View style={[styles.iconCircle, { backgroundColor: accent.soft }]}>
          <MaterialIcons name={meta.icon} size={22} color={accent.fg} />
        </View>
      )}

      <View style={styles.body}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.body ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, marginTop: 2 }]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>

      {!item.read ? <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} /> : null}
    </Pressable>
  );
};

export const NotificationsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { setActiveSocietyId } = useLocalAppState();
  const { notifications, loadNotifications, markAllRead, markRead } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await loadNotifications();
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [loadNotifications]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  // Route by whatever ids the payload carries; always defensive — a missing target
  // just marks the row read without navigating.
  const openNotification = useCallback(
    (item: Notification) => {
      if (!item.read) void markRead([item.id]);

      const data = item.data ?? {};
      const goToSociety = (societyId: string) => {
        setActiveSocietyId(societyId);
        navigation.navigate('SocietyProfile', { societyId });
      };

      if (data.announcementId) {
        navigation.navigate('AnnouncementDetail', { announcementId: data.announcementId });
        return;
      }
      if (data.eventId) {
        navigation.navigate('EventDetail', { eventId: data.eventId });
        return;
      }
      if (data.pollId && data.societyId) {
        navigation.navigate('SocietyPolls', { societyId: data.societyId });
        return;
      }
      if (data.societyId) {
        goToSociety(data.societyId);
        return;
      }
      // Review / approval notifications without a society id have nowhere precise to
      // land from here — the row is already marked read above.
    },
    [navigation, setActiveSocietyId, markRead],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => <NotificationRow item={item} onPress={openNotification} />,
    [openNotification],
  );

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar
        title="Notifications"
        onBack={() => navigation.goBack()}
        actionLabel={notifications.some((n) => !n.read) ? 'Mark all read' : undefined}
        onPressAction={markAllRead}
      />

      {loading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={44} height={44} circle />
              <View style={styles.skeletonBody}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="90%" height={12} />
                <Skeleton width={60} height={11} />
              </View>
            </View>
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="notifications-none"
            title="You're all caught up"
            subtitle="Comments, likes, mentions, and society updates will show up here."
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
          }
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 72,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, alignSelf: 'center' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: spacing.lg + 44 + spacing.md },
  skeletonWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.lg },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skeletonBody: { flex: 1, gap: 8 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
});
