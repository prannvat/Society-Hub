import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { EventCard } from '@/components/EventCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { SocietyDiscoveryCard, societyMemberCount } from '@/components/SocietyDiscoveryCard';
import { FeaturedSocietyCard } from '@/components/FeaturedSocietyCard';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { joinErrorMessage } from '@/services/api/memberships';
import { spacing } from '@/config/theme';
import { SocietyItem, EventItem } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const RAIL_CARD_WIDTH = 224;
const FEATURED_CARD_WIDTH = 300;

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
    selectedInterests,
    profile
  } = useLocalAppState();

  const [searchQuery, setSearchQuery] = useState('');
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

  const societyUniMatches = useMemo(() => {
    return (society: SocietyItem): boolean => {
      if (!userUni) {
        return false;
      }
      const unis = [
        society.university?.toLowerCase(),
        ...(society.affiliatedUniversities || []).map((u) => u.toLowerCase())
      ];
      return unis.includes(userUni);
    };
  }, [userUni]);

  // For-You relevance score: interest match (strongest) > same university > popularity.
  const forYou = useMemo(() => {
    const scoreSociety = (society: SocietyItem): number => {
      const haystack = `${society.name} ${society.description || ''}`.toLowerCase();
      const interestScore = selectedInterests.reduce((acc, interest) => {
        const term = interest.trim().toLowerCase();
        return term && haystack.includes(term) ? acc + 10 : acc;
      }, 0);
      const uniScore = societyUniMatches(society) ? 6 : 0;
      const popScore = Math.min(societyMemberCount(society), 500) / 50; // 0..10
      return interestScore + uniScore + popScore;
    };

    return allSocieties
      .filter((society) => !mySocietyIds.includes(society.id))
      .map((society) => ({ society, score: scoreSociety(society) }))
      .sort((a, b) => b.score - a.score || societyMemberCount(b.society) - societyMemberCount(a.society))
      .slice(0, 10)
      .map((entry) => entry.society);
  }, [allSocieties, mySocietyIds, selectedInterests, societyUniMatches]);

  const featured = useMemo(() => allSocieties.filter((society) => society.isFeatured), [allSocieties]);

  const trending = useMemo(
    () =>
      [...allSocieties]
        .filter((society) => societyMemberCount(society) > 0)
        .sort((a, b) => societyMemberCount(b) - societyMemberCount(a))
        .slice(0, 8),
    [allSocieties]
  );

  const trendingIds = useMemo(() => new Set(trending.slice(0, 5).map((society) => society.id)), [trending]);

  const eventsThisWeek = useMemo(() => {
    const now = Date.now();
    return exploreEvents
      .filter((event) => {
        const t = event.startAtIso ? new Date(event.startAtIso).getTime() : NaN;
        return !Number.isNaN(t) && t >= now && t <= now + WEEK_MS;
      })
      .slice(0, 10);
  }, [exploreEvents]);

  const allSorted = useMemo(
    () =>
      [...allSocieties].sort((a, b) => {
        const aUni = societyUniMatches(a);
        const bUni = societyUniMatches(b);
        if (userUni && aUni !== bUni) {
          return aUni ? -1 : 1;
        }
        return societyMemberCount(b) - societyMemberCount(a);
      }),
    [allSocieties, userUni, societyUniMatches]
  );

  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }
    return allSocieties.filter(
      (society) => society.name.toLowerCase().includes(query) || (society.description || '').toLowerCase().includes(query)
    );
  }, [allSocieties, isSearching, query]);

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

  const cardBindings = (society: SocietyItem) => ({
    society,
    isMember: mySocietyIds.includes(society.id),
    isPending: pendingMembershipSocietyIds.includes(society.id),
    isJoining: joiningSocietyId === society.id,
    onJoin: () => handleJoin(society),
    onPress: () => navigation.navigate('SocietyProfile', { societyId: society.id })
  });

  const renderSectionHeading = (title: string, subtitle?: string, rightText?: string, onPressRight?: () => void) => (
    <View style={styles.sectionHead}>
      <SectionHeader title={title} rightText={rightText} onPressRight={onPressRight} />
      {subtitle ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text>
      ) : null}
    </View>
  );

  const renderSocietyRail = (societies: SocietyItem[]) => (
    <FlatList
      data={societies}
      keyExtractor={(society) => society.id}
      renderItem={({ item }) => (
        <View style={styles.railCard}>
          <SocietyDiscoveryCard {...cardBindings(item)} trending={trendingIds.has(item.id)} />
        </View>
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      snapToInterval={RAIL_CARD_WIDTH + spacing.md}
      decelerationRate="fast"
    />
  );

  const renderEventCard = ({ item }: { item: EventItem }) => (
    <View style={styles.eventCardWrap}>
      <EventCard event={item} onPressRSVP={(ev) => navigation.navigate('EventDetail', { eventId: ev.id })} />
    </View>
  );

  const renderSearchResult = ({ item }: { item: SocietyItem }) => (
    <View style={styles.searchCell}>
      <SocietyDiscoveryCard {...cardBindings(item)} trending={trendingIds.has(item.id)} />
    </View>
  );

  const renderDiscovery = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoadingExplore} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
    >
      {featured.length > 0 ? (
        <View style={styles.section}>
          {renderSectionHeading('Featured', 'Handpicked by your students’ union')}
          <FlatList
            data={featured}
            keyExtractor={(society) => society.id}
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                <FeaturedSocietyCard {...cardBindings(item)} />
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={FEATURED_CARD_WIDTH + spacing.md}
            decelerationRate="fast"
          />
        </View>
      ) : null}

      {forYou.length > 0 ? (
        <View style={styles.section}>
          {renderSectionHeading('For You', 'Matched to your interests')}
          {renderSocietyRail(forYou)}
        </View>
      ) : null}

      {trending.length > 0 ? (
        <View style={styles.section}>
          {renderSectionHeading('Trending on campus', 'The societies students are joining now')}
          {renderSocietyRail(trending)}
        </View>
      ) : null}

      {eventsThisWeek.length > 0 ? (
        <View style={styles.section}>
          {renderSectionHeading('Happening this week', undefined, 'See all', () =>
            navigation.navigate('MainTabs', { screen: 'Events' })
          )}
          <FlatList
            data={eventsThisWeek}
            keyExtractor={(event) => event.id}
            renderItem={renderEventCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            snapToInterval={280 + spacing.md}
            decelerationRate="fast"
          />
        </View>
      ) : null}

      <View style={styles.section}>
        {renderSectionHeading('All societies', 'Browse everything on campus')}
        {allSorted.length > 0 ? (
          <View style={styles.grid}>
            {allSorted.map((society) => (
              <View key={society.id} style={styles.gridCell}>
                <SocietyDiscoveryCard {...cardBindings(society)} trending={trendingIds.has(society.id)} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="groups"
            title="Nothing here yet"
            subtitle="Check back soon for societies to join."
          />
        )}
      </View>
    </ScrollView>
  );

  const renderSkeleton = () => (
    <View style={styles.scrollContent}>
      {[0, 1].map((row) => (
        <View key={row} style={styles.section}>
          <View style={styles.sectionHead}>
            <Skeleton width={160} height={18} />
          </View>
          <View style={[styles.rail, styles.skeletonRail]}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.railCard}>
                <Card style={styles.skeletonCard}>
                  <Skeleton width={44} height={44} radius={theme.radius.card} />
                  <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
                  <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
                  <Skeleton width="100%" height={34} radius={theme.radius.pill} style={{ marginTop: 24 }} />
                </Card>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader title="Explore" subtitle="Find your people across every society" />
      </View>

      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search societies..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(society) => society.id}
          renderItem={renderSearchResult}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.searchList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.sectionHead}>
              <SectionHeader title={`Results for “${searchQuery.trim()}”`} />
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-off"
              title="No societies found"
              subtitle="Try a different search term."
              actionLabel="Clear search"
              onAction={() => setSearchQuery('')}
            />
          }
        />
      ) : !societiesLoaded ? (
        renderSkeleton()
      ) : (
        renderDiscovery()
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
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionHead: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm
  },
  rail: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  skeletonRail: {
    flexDirection: 'row',
    overflow: 'hidden'
  },
  skeletonCard: {
    minHeight: 214
  },
  railCard: {
    width: RAIL_CARD_WIDTH
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH
  },
  eventCardWrap: {
    width: 280
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between'
  },
  gridCell: {
    width: '48%',
    marginBottom: spacing.md
  },
  searchCell: {
    flex: 1,
    marginBottom: spacing.md
  },
  columnWrapper: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md
  },
  searchList: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl
  }
});
