import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopNavBar } from '@/components/TopNavBar';
import { SearchBar } from '@/components/SearchBar';
import { SectionHeader } from '@/components/SectionHeader';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { MaterialIcons } from '@expo/vector-icons';
import { joinErrorMessage } from '@/services/api/memberships';
import { SocietyItem, EventItem } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExploreSocieties'>;

export const ExploreSocietiesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { allSocieties, mySocietyIds, pendingMembershipSocietyIds, joinSociety, exploreEvents, loadExploreEvents, loadSocieties, announcements, profile } = useLocalAppState();

  useEffect(() => {
    loadSocieties().then(() => loadExploreEvents());
  }, [loadExploreEvents]);

  const [searchQuery, setSearchQuery] = useState('');
  const [joiningSocietyId, setJoiningSocietyId] = useState<string | null>(null);

  const discoverableSocieties = [...allSocieties]
    .filter(s => !mySocietyIds.includes(s.id))
    .sort((a, b) => {
      const u = profile.university?.toLowerCase() || '';
      const aUnis = [a.university?.toLowerCase(), ...(a.affiliatedUniversities || []).map(x => x.toLowerCase())].filter(Boolean);
      const bUnis = [b.university?.toLowerCase(), ...(b.affiliatedUniversities || []).map(x => x.toLowerCase())].filter(Boolean);

      const aMatchesUni = u && aUnis.includes(u);
      const bMatchesUni = u && bUnis.includes(u);

      if (aMatchesUni && !bMatchesUni) return -1;
      if (!aMatchesUni && bMatchesUni) return 1;

      return 0; // fallback to default order
    });

  const filteredSocieties = (searchQuery.trim().length > 0 ? allSocieties : discoverableSocieties).filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = exploreEvents.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <View style={styles.societyCardWrap}>
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
              <BadgeChip label="Pending" variant="warning" style={{ alignSelf: 'center' }} />
            ) : isMember ? (
              <BadgeChip label="Joined" variant="success" style={{ alignSelf: 'center' }} />
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

  return (
    <ScreenLayout scroll={false}>
      <View style={{ flex: 1 }}>
        <TopNavBar title="Explore" onBack={() => navigation.goBack()} />

        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search societies and events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {searchQuery ? (
            <View>
              <View style={styles.sectionPad}>
                <SectionHeader title="Events" />
              </View>
              {filteredEvents.length === 0 ? (
                <EmptyState icon="event-busy" title="No events found" subtitle="Try a different search term" />
              ) : (
                <FlatList
                  data={filteredEvents}
                  keyExtractor={e => e.id}
                  renderItem={renderEventCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={280 + 16}
                  decelerationRate="fast"
                />
              )}

              <View style={[styles.sectionPad, { marginTop: 24 }]}>
                <SectionHeader title="Societies" />
              </View>
              {filteredSocieties.length === 0 ? (
                <EmptyState
                  icon="search-off"
                  title="No societies found"
                  subtitle="Try adjusting your search"
                  actionLabel="Clear search"
                  onAction={() => setSearchQuery('')}
                />
              ) : (
                <FlatList
                  data={filteredSocieties}
                  keyExtractor={s => s.id}
                  renderItem={renderSocietyCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={220 + 16}
                  decelerationRate="fast"
                />
              )}
            </View>
          ) : (
            <View>
              {/* Featured Events */}
              <View style={styles.sectionPad}>
                <SectionHeader
                  title="Trending Events"
                  rightText="See all"
                  onPressRight={() => navigation.navigate('MainTabs', { screen: 'Events' })}
                />
              </View>
              <FlatList
                data={exploreEvents.slice(0, 5)}
                keyExtractor={item => item.id}
                renderItem={renderEventCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                snapToInterval={280 + 16}
                decelerationRate="fast"
              />

              {/* Discover Societies */}
              <View style={[styles.sectionPad, { marginTop: 24 }]}>
                <SectionHeader title="Discover Societies" />
              </View>
              {discoverableSocieties.length === 0 ? (
                <EmptyState
                  icon="check-circle-outline"
                  title="You're all caught up"
                  subtitle="You've joined every society we could find for you"
                />
              ) : (
                <FlatList
                  data={discoverableSocieties.slice(0, 6)}
                  keyExtractor={item => item.id}
                  renderItem={renderSocietyCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  snapToInterval={220 + 16}
                  decelerationRate="fast"
                />
              )}

              {/* University Updates */}
              <View style={[styles.sectionPad, { marginTop: 24 }]}>
                <SectionHeader
                  title="Campus Hub"
                  rightText="View all"
                  onPressRight={() => navigation.navigate('AnnouncementsFeed')}
                />
              </View>
              <View style={styles.verticalList}>
                {announcements.length === 0 ? (
                  <EmptyState icon="campaign" title="No notices yet" subtitle="Campus announcements will appear here" />
                ) : (
                  announcements.slice(0, 5).map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      item={announcement}
                      onPress={(selected) => navigation.navigate('AnnouncementDetail', { announcementId: selected.id })}
                    />
                  ))
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 12
  },
  scrollContent: {
    paddingBottom: 40
  },
  sectionPad: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16
  },
  verticalList: {
    paddingHorizontal: 16,
    gap: 12
  },
  eventCardWrap: {
    width: 280
  },
  societyCardWrap: {
    width: 220
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
  }
});
