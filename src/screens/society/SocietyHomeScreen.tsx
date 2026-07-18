import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { EmptyState } from '@/components/EmptyState';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from '../ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Society-account Home: the society's own published content, with a create prompt. */
export const SocietyHomeScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, announcements, events, polls, refreshActiveSociety } = useLocalAppState();
  const societyId = selectedAdminSocietyId ?? '';
  const society = allSocieties.find((s) => s.id === societyId);

  const feed = [
    ...announcements.map((a) => ({ kind: 'post' as const, id: `p_${a.id}`, item: a })),
    ...events.map((e) => ({ kind: 'event' as const, id: `e_${e.id}`, item: e })),
  ];

  const composer = (
    <Card onPress={() => navigation.navigate('CreatePost', { societyId })} style={{ marginBottom: spacing.md }}>
      <View style={styles.composer}>
        <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={40} />
        <Text style={[theme.typography.body, { color: theme.colors.textTertiary, flex: 1 }]}>Share an update…</Text>
        <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.quickRow}>
        {[
          { icon: 'campaign', label: 'Post', screen: 'CreatePost' as const },
          { icon: 'event', label: 'Event', screen: 'CreateEvent' as const },
          { icon: 'how-to-vote', label: 'Poll', screen: 'CreatePoll' as const },
        ].map((q) => (
          <Pressable
            key={q.label}
            onPress={() => navigation.navigate(q.screen, { societyId })}
            style={({ pressed }) => [styles.quick, { backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surfaceSunken, borderRadius: theme.radius.input }]}
          >
            <MaterialIcons name={q.icon as keyof typeof MaterialIcons.glyphMap} size={18} color={theme.colors.primary} />
            <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>{q.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof feed)[number] }) =>
      item.kind === 'post' ? (
        <View style={{ marginBottom: spacing.md }}>
          <AnnouncementCard item={item.item} onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.item.id })} />
        </View>
      ) : (
        <View style={{ marginBottom: spacing.md }}>
          <EventCard event={item.item} onPressRSVP={() => navigation.navigate('EventDetail', { eventId: item.item.id })} />
        </View>
      ),
    [navigation],
  );

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.header}>
        <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{society?.name ?? 'Society'}</Text>
        <BadgeChip label={`${polls.length} polls`} variant="neutral" />
      </View>
      <FlatList
        data={feed}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListHeaderComponent={composer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refreshActiveSociety} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <EmptyState icon="post-add" title="No posts yet" subtitle="Share your first update, event, or poll to reach your members." />
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  quick: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm },
});
