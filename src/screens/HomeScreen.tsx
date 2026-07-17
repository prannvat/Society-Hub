import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, ScrollView, useWindowDimensions, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { SectionHeader } from '@/components/SectionHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips } from '@/components/FilterChips';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { joinErrorMessage } from '@/services/api/memberships';
import { SocietyItem } from '@/types';
import { ScreenLayout } from './ScreenLayout';

type DiscoveryFilter = 'All' | 'Events' | 'Societies' | 'Announcements';

const DISCOVERY_FILTERS: DiscoveryFilter[] = ['All', 'Events', 'Societies', 'Announcements'];

const SocietyMark = ({ society, size = 44 }: { society: SocietyItem; size?: number }) => {
  const theme = useAppTheme();
  const brand = society.primaryColor || theme.colors.primary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.card,
        backgroundColor: `${brand}22`,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text style={[theme.typography.captionMedium, { color: brand, fontSize: Math.round(size * 0.3) }]} numberOfLines={1}>
        {society.shortName}
      </Text>
    </View>
  );
};

export const HomeScreen = () => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const {
    allSocieties,
    exploreEvents,
    announcements,
    mySocietyIds,
    pendingMembershipSocietyIds,
    joinSociety,
    loadExploreEvents,
    isLoadingExplore,
    profile
  } = useLocalAppState();

  const [selectedFilter, setSelectedFilter] = useState<DiscoveryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [joiningSocietyId, setJoiningSocietyId] = useState<string | null>(null);

  const eventCardWidth = Math.max(248, Math.min(320, width - 96));

  useEffect(() => {
    loadExploreEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExploreEvents();
    setRefreshing(false);
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

  const isInitialLoading = isLoadingExplore && exploreEvents.length === 0 && allSocieties.length === 0;

  // Filter content based on search and filter
  const filteredSocieties = allSocieties.filter(society =>
    (!searchQuery || society.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedFilter === 'All' || selectedFilter === 'Societies')
  );

  const filteredEvents = exploreEvents.filter(event =>
    (!searchQuery || event.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedFilter === 'All' || selectedFilter === 'Events')
  );

  const filteredAnnouncements = announcements.filter(announcement =>
    (!searchQuery || announcement.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedFilter === 'All' || selectedFilter === 'Announcements')
  );

  const popularSocieties = allSocieties
    .filter(society => !mySocietyIds.includes(society.id))
    .slice(0, 6);

  const renderSocietyRow = (society: SocietyItem) => {
    const isMember = mySocietyIds.includes(society.id);
    const isPending = pendingMembershipSocietyIds.includes(society.id);
    const brand = society.primaryColor || theme.colors.primary;

    return (
      <Card key={society.id} padding={0} onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}>
        <View style={styles.societyRow}>
          <View style={[styles.societyAccent, { backgroundColor: brand }]} />
          <View style={styles.societyRowBody}>
            <SocietyMark society={society} />
            <View style={styles.societyRowInfo}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {society.name}
              </Text>
              {society.description ? (
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {society.description}
                </Text>
              ) : null}
              <View style={styles.societyMetaRow}>
                <MaterialIcons name="groups" size={14} color={theme.colors.textTertiary} />
                <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                  {society._count?.memberships || 0} members
                </Text>
              </View>
            </View>
            {isPending ? (
              <BadgeChip label="Pending" variant="warning" />
            ) : isMember ? (
              <BadgeChip label="Joined" variant="success" />
            ) : (
              <PrimaryButton
                label="Join"
                size="sm"
                loading={joiningSocietyId === society.id}
                onPress={() => handleJoin(society)}
              />
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="Discover"
            subtitle={profile.university || 'Find your community on campus'}
            accessory={
              <Pressable
                onPress={() => navigation.navigate('ExploreSocieties')}
                hitSlop={6}
                android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
                style={({ pressed }) => [
                  styles.headerAction,
                  theme.elevation.e1,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.7 : 1
                  }
                ]}
              >
                <MaterialIcons name="search" size={22} color={theme.colors.textPrimary} />
              </Pressable>
            }
          />
        </View>

        {/* Search and Filters */}
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder="Search societies, events, and more..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={{ marginTop: theme.spacing.md }}>
            <FilterChips
              items={DISCOVERY_FILTERS}
              onChange={(selected) => setSelectedFilter(selected as DiscoveryFilter)}
            />
          </View>
        </View>

        {/* Loading skeletons */}
        {isInitialLoading ? (
          <View style={styles.skeletonWrap}>
            {[0, 1, 2].map((index) => (
              <Card key={index}>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <Skeleton width={56} height={56} radius={theme.radius.card} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="100%" height={12} />
                    <Skeleton width="45%" height={12} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        {/* Quick Actions */}
        {!isInitialLoading && !searchQuery && selectedFilter === 'All' && (
          <View style={styles.section}>
            <SectionHeader title="Quick Actions" />
            <View style={styles.quickActionsRow}>
              {(
                [
                  { icon: 'explore', title: 'Browse', caption: 'All Societies', onPress: () => navigation.navigate('ExploreSocieties') },
                  { icon: 'event', title: 'Events', caption: 'This Week', onPress: () => navigation.navigate('MainTabs', { screen: 'Events' }) },
                  { icon: 'add-circle-outline', title: 'Create', caption: 'New Society', onPress: () => navigation.navigate('CreateSociety') }
                ] as const
              ).map((action) => (
                <View key={action.title} style={{ flex: 1 }}>
                  <Card onPress={action.onPress}>
                    <View style={styles.quickAction}>
                      <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primarySoft }]}>
                        <MaterialIcons name={action.icon} size={22} color={theme.colors.primary} />
                      </View>
                      <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary }]}>
                        {action.title}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textTertiary, fontSize: 11 }]} numberOfLines={1}>
                        {action.caption}
                      </Text>
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Popular Societies */}
        {!isInitialLoading && !searchQuery && selectedFilter === 'All' && popularSocieties.length > 0 && (
          <View style={styles.sectionNoPad}>
            <View style={styles.sectionPad}>
              <SectionHeader title="Popular Societies" rightText="See all" onPressRight={() => navigation.navigate('ExploreSocieties')} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={{ marginTop: theme.spacing.md }}
            >
              {popularSocieties.map((society) => (
                <View key={society.id} style={{ width: 180 }}>
                  <Card onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}>
                    <SocietyMark society={society} size={40} />
                    <Text
                      style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 10 }]}
                      numberOfLines={1}
                    >
                      {society.shortName}
                    </Text>
                    <Text
                      style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2, minHeight: 36 }]}
                      numberOfLines={2}
                    >
                      {society.description || society.name}
                    </Text>
                    <View style={styles.societyMetaRow}>
                      <MaterialIcons name="groups" size={14} color={theme.colors.textTertiary} />
                      <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                        {society._count?.memberships || 0} members
                      </Text>
                    </View>
                  </Card>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upcoming Events */}
        {!isInitialLoading && (selectedFilter === 'All' || selectedFilter === 'Events') && filteredEvents.length > 0 && (
          <View style={styles.sectionNoPad}>
            <View style={styles.sectionPad}>
              <SectionHeader
                title="Upcoming Events"
                rightText="See all"
                onPressRight={() => navigation.navigate('MainTabs', { screen: 'Events' })}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              style={{ marginTop: theme.spacing.md }}
            >
              {filteredEvents.slice(0, 5).map((event) => (
                <View key={event.id} style={{ width: eventCardWidth }}>
                  <EventCard
                    event={event}
                    onPressRSVP={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Societies list (when filtering or searching) */}
        {!isInitialLoading && (selectedFilter === 'Societies' || searchQuery.length > 0) && filteredSocieties.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Societies" />
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
              {filteredSocieties.slice(0, searchQuery ? 20 : 6).map(renderSocietyRow)}
            </View>
          </View>
        )}

        {/* Latest Announcements */}
        {!isInitialLoading && (selectedFilter === 'All' || selectedFilter === 'Announcements') && filteredAnnouncements.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Latest News"
              rightText="See all"
              onPressRight={() => navigation.navigate('AnnouncementsFeed')}
            />
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.lg }}>
              {filteredAnnouncements.slice(0, 3).map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  item={announcement}
                  onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: announcement.id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty states */}
        {!isInitialLoading &&
          searchQuery.length > 0 &&
          filteredSocieties.length === 0 &&
          filteredEvents.length === 0 &&
          filteredAnnouncements.length === 0 && (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon="search-off"
                title="No results found"
                subtitle="Try adjusting your search or explore all societies"
                actionLabel="Clear search"
                onAction={() => setSearchQuery('')}
              />
            </View>
          )}

        {!isInitialLoading && !searchQuery && selectedFilter === 'All' && allSocieties.length === 0 && (
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="explore"
              title="Welcome to SocietyHub"
              subtitle="Discover societies, events, and connect with your university community"
            />
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  skeletonWrap: {
    paddingHorizontal: 20,
    gap: 12
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionNoPad: {
    marginBottom: 24
  },
  sectionPad: {
    paddingHorizontal: 20
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  quickAction: {
    alignItems: 'center',
    gap: 4
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16
  },
  societyRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 16
  },
  societyAccent: {
    width: 4,
    alignSelf: 'stretch'
  },
  societyRowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14
  },
  societyRowInfo: {
    flex: 1,
    gap: 2
  },
  societyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  emptyWrap: {
    paddingHorizontal: 20,
    paddingVertical: 24
  }
});
