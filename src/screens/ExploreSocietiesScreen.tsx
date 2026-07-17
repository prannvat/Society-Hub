import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { FilterChips } from '@/components/FilterChips';
import { EventCard } from '@/components/EventCard';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { MaterialIcons } from '@expo/vector-icons';
import { joinErrorMessage } from '@/services/api/memberships';
import { spacing } from '@/config/theme';
import { SocietyItem, EventItem } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExploreSocieties'>;

const FILTERS = ['All', 'My University', 'Open to join'] as const;
type Filter = (typeof FILTERS)[number];

export const ExploreSocietiesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const {
    allSocieties,
    mySocietyIds,
    pendingMembershipSocietyIds,
    joinSociety,
    exploreEvents,
    loadExploreEvents,
    loadSocieties,
    isLoadingExplore,
    profile
  } = useLocalAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [joiningSocietyId, setJoiningSocietyId] = useState<string | null>(null);
  const [societiesLoaded, setSocietiesLoaded] = useState(false);

  useEffect(() => {
    loadSocieties().finally(() => setSocietiesLoaded(true));
  }, [loadSocieties]);

  useEffect(() => {
    loadExploreEvents();
  }, [loadExploreEvents]);

  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.trim().toLowerCase();
  const userUni = profile.university?.toLowerCase() || '';

  const filteredSocieties = useMemo(() => {
    const matchesFilter = (society: SocietyItem) => {
      if (filter === 'Open to join') {
        return society.joinPolicy === 'OPEN' || !society.joinPolicy;
      }
      if (filter === 'My University') {
        const unis = [society.university?.toLowerCase(), ...(society.affiliatedUniversities || []).map((u) => u.toLowerCase())];
        return Boolean(userUni) && unis.includes(userUni);
      }
      return true;
    };

    const matchesSearch = (society: SocietyItem) =>
      society.name.toLowerCase().includes(query) || (society.description || '').toLowerCase().includes(query);

    return allSocieties
      .filter((society) => matchesFilter(society) && (!isSearching || matchesSearch(society)))
      .sort((a, b) => {
        // Surface the user's own university first for discovery.
        const aUni = [a.university?.toLowerCase(), ...(a.affiliatedUniversities || []).map((u) => u.toLowerCase())].includes(userUni);
        const bUni = [b.university?.toLowerCase(), ...(b.affiliatedUniversities || []).map((u) => u.toLowerCase())].includes(userUni);
        if (userUni && aUni !== bUni) {
          return aUni ? -1 : 1;
        }
        return 0;
      });
  }, [allSocieties, filter, isSearching, query, userUni]);

  const trendingEvents = useMemo(() => exploreEvents.slice(0, 8), [exploreEvents]);

  const handleRefresh = () => {
    loadSocieties();
    loadExploreEvents();
  };

  const handleJoin = async (society: SocietyItem) => {
    if (joiningSocietyId) {
      return;
    }
    setJoiningSocietyId(society.id);
    try {
      const result = await joinSociety(society.id);
      if (result === 'PENDING') {
        toast.show(`Request sent — ${society.name} requires approval`, 'info');
      } else {
        toast.show(`Welcome to ${society.name}!`, 'success');
      }
    } catch (error) {
      toast.show(joinErrorMessage(error), 'error');
    } finally {
      setJoiningSocietyId(null);
    }
  };

  const renderSocietyCard = ({ item }: { item: SocietyItem }) => {
    const isMember = mySocietyIds.includes(item.id);
    const isPending = pendingMembershipSocietyIds.includes(item.id);
    const brand = item.primaryColor || theme.colors.primary;

    return (
      <View style={styles.gridCell}>
        <Card padding={0} onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })} style={styles.societyCard}>
          <View style={[styles.societyAccent, { backgroundColor: brand }]} />
          <View style={styles.societyCardContent}>
            {item.logoUrl ? (
              <Image
                source={{ uri: item.logoUrl }}
                style={[styles.societyLogo, { borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceSunken }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.societyLogo, { borderRadius: theme.radius.card, backgroundColor: `${brand}22` }]}>
                <Text style={[theme.typography.captionMedium, { color: brand }]} numberOfLines={1}>
                  {item.shortName}
                </Text>
              </View>
            )}
            <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 10 }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text
              style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2, minHeight: 36 }]}
              numberOfLines={2}
            >
              {item.description || 'Official university society.'}
            </Text>
            <View style={styles.societyMetaRow}>
              <MaterialIcons name="groups" size={14} color={theme.colors.textTertiary} />
              <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                {item._count?.memberships || 0} members
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            {isPending ? (
              <BadgeChip label="Pending" variant="warning" style={styles.statusChip} />
            ) : isMember ? (
              <BadgeChip label="Joined" variant="success" style={styles.statusChip} />
            ) : (
              <PrimaryButton
                label="Join"
                size="sm"
                loading={joiningSocietyId === item.id}
                onPress={() => handleJoin(item)}
              />
            )}
          </View>
        </Card>
      </View>
    );
  };

  const renderEventCard = ({ item }: { item: EventItem }) => (
    <View style={styles.eventCardWrap}>
      <EventCard event={item} onPressRSVP={(ev) => navigation.navigate('EventDetail', { eventId: ev.id })} />
    </View>
  );

  const listHeader = (
    <View>
      {!isSearching && trendingEvents.length > 0 ? (
        <View style={styles.strip}>
          <View style={styles.sectionPad}>
            <SectionHeader
              title="Trending events"
              rightText="See all"
              onPressRight={() => navigation.navigate('MainTabs', { screen: 'Events' })}
            />
          </View>
          <FlatList
            data={trendingEvents}
            keyExtractor={(event) => event.id}
            renderItem={renderEventCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            snapToInterval={280 + spacing.md}
            decelerationRate="fast"
          />
        </View>
      ) : null}
      <View style={styles.sectionPad}>
        <SectionHeader title={isSearching ? `Results for "${searchQuery.trim()}"` : 'Discover societies'} />
      </View>
    </View>
  );

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Explore" subtitle="Find your people across every society" />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search societies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterWrap}>
        <FilterChips items={[...FILTERS]} onChange={(value) => setFilter(value as Filter)} />
      </View>

      {!societiesLoaded ? (
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCell}>
              <Card style={styles.societyCard}>
                <Skeleton width={44} height={44} radius={theme.radius.card} />
                <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
                <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
                <Skeleton width={72} height={30} radius={theme.radius.pill} style={{ marginTop: 16 }} />
              </Card>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredSocieties}
          keyExtractor={(society) => society.id}
          renderItem={renderSocietyCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={isLoadingExplore} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon={isSearching ? 'search-off' : 'groups'}
              title={isSearching ? 'No societies found' : 'Nothing here yet'}
              subtitle={isSearching ? 'Try a different search or filter.' : 'Check back soon for societies to join.'}
              actionLabel={isSearching ? 'Clear search' : undefined}
              onAction={isSearching ? () => setSearchQuery('') : undefined}
            />
          }
        />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  filterWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs
  },
  list: {
    paddingBottom: spacing.xxl
  },
  columnWrapper: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  gridCell: {
    flex: 1,
    marginBottom: spacing.md
  },
  strip: {
    marginBottom: spacing.md
  },
  sectionPad: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  eventCardWrap: {
    width: 280
  },
  societyCard: {
    minHeight: 250,
    overflow: 'hidden'
  },
  societyAccent: {
    height: 4,
    width: '100%'
  },
  societyCardContent: {
    flex: 1,
    padding: 14
  },
  societyLogo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  societyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  statusChip: {
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  skeletonCell: {
    width: '47%',
    flexGrow: 1
  }
});
