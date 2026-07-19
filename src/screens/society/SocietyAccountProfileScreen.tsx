import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { useAccountSwitcher } from '@/hooks/useAccountSwitcher';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { AnnouncementItem, EventItem } from '@/types';
import { ScreenLayout } from '../ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type GridTile =
  | { kind: 'post'; id: string; item: AnnouncementItem }
  | { kind: 'event'; id: string; item: EventItem };

/**
 * The society's own profile, Instagram-style, shown when you're acting AS the society.
 * Doubles as the management anchor: identity, owner actions, and a grid of its content.
 */
export const SocietyAccountProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const { selectedAdminSocietyId } = useUserRoles();
  const { allSocieties, announcements, events, activeSocietyMemberCount } = useLocalAppState();
  const { openSwitcher } = useAccountSwitcher();

  const societyId = selectedAdminSocietyId ?? '';
  const society = allSocieties.find((s) => s.id === societyId);

  const tiles = useMemo<GridTile[]>(
    () => [
      ...announcements.map((a) => ({ kind: 'post' as const, id: `p_${a.id}`, item: a })),
      ...events.map((e) => ({ kind: 'event' as const, id: `e_${e.id}`, item: e })),
    ],
    [announcements, events],
  );

  const stat = (label: string, value: number) => (
    <View style={styles.stat}>
      <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <ScreenLayout>
      {/* Account bar — tap to switch accounts, IG-style */}
      <Pressable
        style={({ pressed }) => [styles.accountBar, { opacity: pressed ? 0.6 : 1 }]}
        onPress={openSwitcher}
        accessibilityRole="button"
        accessibilityLabel={`${society?.shortName || society?.name}. Tap to switch account`}
      >
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {society?.shortName || society?.name}
        </Text>
        <MaterialIcons name="unfold-more" size={20} color={theme.colors.textSecondary} />
      </Pressable>

      <View style={[styles.band, { borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceSunken }]} />

      <View style={styles.body}>
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { backgroundColor: theme.colors.background }]}>
            <Avatar name={society?.name ?? 'Society'} url={society?.logoUrl ?? undefined} size={76} />
          </View>
          <View style={styles.stats}>
            {stat('Members', activeSocietyMemberCount)}
            {stat('Events', events.length)}
            {stat('Posts', announcements.length)}
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={2}>
            {society?.name ?? 'Society'}
          </Text>
          {society?.isFeatured ? <BadgeChip label="Featured" variant="warning" /> : null}
        </View>
        {society?.shortName ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>@{society.shortName}</Text>
        ) : null}
        {society?.university ? (
          <View style={styles.metaRow}>
            <MaterialIcons name="school" size={14} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {society.university}
            </Text>
          </View>
        ) : null}
        {society?.description ? (
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary, marginTop: spacing.xs }]}>
            {society.description}
          </Text>
        ) : null}

        {/* Owner actions */}
        <View style={styles.actions}>
          <View style={styles.actionCell}>
            <PrimaryButton label="Edit profile" variant="secondary" size="md" icon="edit" onPress={() => navigation.navigate('EditSocietyProfile')} />
          </View>
          <View style={styles.actionCell}>
            <PrimaryButton label="Create" size="md" icon="add" onPress={() => navigation.navigate('CreateHub', { societyId })} />
          </View>
        </View>
        <View style={styles.actions}>
          <View style={styles.actionCell}>
            <PrimaryButton
              label="Insights"
              variant="secondary"
              size="md"
              icon="insights"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Insights' })}
            />
          </View>
          <View style={styles.actionCell}>
            <PrimaryButton
              label="View as public"
              variant="secondary"
              size="md"
              icon="visibility"
              onPress={() => navigation.navigate('SocietyProfile', { societyId })}
            />
          </View>
        </View>

        {/* Content grid */}
        <View style={styles.gridSection}>
          <SectionHeader title="Content" />
          {tiles.length > 0 ? (
            <View style={styles.grid}>
              {tiles.map((tile) => (
                <ContentTile
                  key={tile.id}
                  tile={tile}
                  onPress={() =>
                    tile.kind === 'post'
                      ? navigation.navigate('AnnouncementDetail', { announcementId: tile.item.id })
                      : navigation.navigate('EventDetail', { eventId: tile.item.id })
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="grid-view"
              title="Nothing published yet"
              subtitle="Posts and events you publish appear here as a grid, just like an Instagram profile."
              actionLabel="Create your first"
              onAction={() => navigation.navigate('CreateHub', { societyId })}
            />
          )}
        </View>
      </View>

    </ScreenLayout>
  );
};

const ContentTile = ({
  tile,
  onPress,
}: {
  tile: GridTile;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const poster =
    tile.kind === 'event' && typeof tile.item.posterImageUrl === 'string' && /^https?:\/\//i.test(tile.item.posterImageUrl)
      ? tile.item.posterImageUrl
      : undefined;
  const eventDate =
    tile.kind === 'event' ? new Date(tile.item.startAtIso ?? tile.item.date) : null;
  const hasDate = eventDate && !Number.isNaN(eventDate.getTime());

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { borderRadius: theme.radius.card, opacity: pressed ? 0.85 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={tile.kind === 'post' ? tile.item.title : tile.item.title}
    >
      {poster ? (
        <>
          <Image source={{ uri: poster }} style={styles.tileImage} resizeMode="cover" />
          <View style={[styles.tileScrim, { backgroundColor: theme.colors.overlay }]} />
          <View style={styles.tileFooter}>
            <MaterialIcons name="event" size={14} color="#FFFFFF" />
            <Text style={[theme.typography.captionMedium, styles.tileImageText]} numberOfLines={2}>
              {tile.item.title}
            </Text>
          </View>
        </>
      ) : tile.kind === 'event' ? (
        <View style={[styles.tileFill, { backgroundColor: theme.colors.surfaceSunken }]}>
          {hasDate ? (
            <>
              <Text style={[theme.typography.h2, { color: theme.colors.textPrimary }]}>{eventDate!.getDate()}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>
                {eventDate!.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </Text>
            </>
          ) : (
            <MaterialIcons name="event" size={22} color={theme.colors.textSecondary} />
          )}
          <Text
            style={[theme.typography.caption, styles.tileEventTitle, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {tile.item.title}
          </Text>
        </View>
      ) : (
        <View style={[styles.tileFill, { backgroundColor: theme.colors.surfaceSunken }]}>
          <MaterialIcons name="campaign" size={18} color={theme.colors.textSecondary} />
          <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary, marginTop: 6 }]} numberOfLines={4}>
            {tile.item.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  accountBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 44 },
  band: { height: 88, marginHorizontal: spacing.lg },
  body: { paddingHorizontal: spacing.lg, gap: 2, paddingBottom: spacing.xxl },
  identity: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg, marginTop: -36 },
  avatarRing: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: spacing.xs },
  stat: { alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionCell: { flex: 1 },
  gridSection: { marginTop: spacing.xl, gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { width: '31.5%', aspectRatio: 1, overflow: 'hidden', backgroundColor: 'transparent' },
  tileFill: { flex: 1, padding: spacing.sm, alignItems: 'flex-start', justifyContent: 'center' },
  tileImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  tileScrim: { ...StyleSheet.absoluteFillObject },
  tileFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.sm, gap: 2 },
  tileImageText: { color: '#FFFFFF' },
  tileEventTitle: { marginTop: 'auto', opacity: 0.95 },
});
