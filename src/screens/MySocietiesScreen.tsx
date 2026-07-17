import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { EventCard } from '@/components/EventCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { ScreenLayout } from './ScreenLayout';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FilterChips } from '@/components/FilterChips';
import { useToast } from '@/components/Toast';
import { MemberRole, SocietyItem } from '@/types';

type FeedFilter = 'All' | 'Events' | 'Announcements' | 'Polls';

const FEED_FILTERS: FeedFilter[] = ['All', 'Events', 'Announcements', 'Polls'];

export const MySocietiesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const toast = useToast();
  const {
    mySocietyIds,
    allSocieties,
    events,
    announcements,
    polls,
    activeSocietyId,
    setActiveSocietyId,
    favouritedSocietyIds,
    toggleFavouriteSociety,
    pendingMembershipSocietyIds
  } = useLocalAppState();
  const { adminSocieties } = useUserRoles();

  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const mySocieties = allSocieties.filter(society => mySocietyIds.includes(society.id));
  const displayedSocieties = showFavoritesOnly
    ? mySocieties.filter(society => favouritedSocietyIds.includes(society.id))
    : mySocieties;
  const pendingSocieties = allSocieties.filter(society => pendingMembershipSocietyIds.includes(society.id));

  const roleForSociety = (societyId: string): MemberRole =>
    adminSocieties.find((relation) => relation.societyId === societyId)?.role ?? 'Member';

  const roleChipVariant = (role: MemberRole) =>
    role === 'President' ? 'primary' : role === 'Committee' ? 'warning' : 'neutral';

  const handleSocietyPress = (societyId: string) => {
    navigation.navigate('SocietyProfile', { societyId });
  };

  const handleMakeActive = (society: SocietyItem) => {
    setActiveSocietyId(society.id);
    toast.show(`${society.shortName} is now your active society`, 'success');
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleAnnouncementPress = (announcementId: string) => {
    navigation.navigate('AnnouncementDetail', { announcementId });
  };

  const handlePollPress = () => {
    navigation.navigate('MainTabs', { screen: 'Polls' });
  };

  const filteredContent = React.useMemo(() => {
    const content: Array<{
      type: 'event' | 'announcement' | 'poll';
      data: any;
      societyName?: string;
      timestamp: Date;
    }> = [];

    // Add events
    if (selectedFilter === 'All' || selectedFilter === 'Events') {
      events.forEach(event => {
        const society = allSocieties.find(s => s.id === event.societyId);
        if (mySocietyIds.includes(event.societyId) &&
            (!showFavoritesOnly || favouritedSocietyIds.includes(event.societyId))) {
          content.push({
            type: 'event',
            data: event,
            societyName: society?.name,
            timestamp: new Date(event.startAtIso || event.date)
          });
        }
      });
    }

    // Add announcements
    if (selectedFilter === 'All' || selectedFilter === 'Announcements') {
      announcements.forEach(announcement => {
        // Assuming announcement has societyId - you may need to adjust this
        content.push({
          type: 'announcement',
          data: announcement,
          timestamp: new Date(announcement.timestamp)
        });
      });
    }

    // Add polls
    if (selectedFilter === 'All' || selectedFilter === 'Polls') {
      polls.forEach(poll => {
        const society = allSocieties.find(s => s.id === poll.societyId);
        if (mySocietyIds.includes(poll.societyId) &&
            (!showFavoritesOnly || favouritedSocietyIds.includes(poll.societyId))) {
          content.push({
            type: 'poll',
            data: poll,
            societyName: society?.name,
            timestamp: new Date(poll.createdAt)
          });
        }
      });
    }

    return content.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [selectedFilter, showFavoritesOnly, events, announcements, polls, mySocietyIds, favouritedSocietyIds, allSocieties]);

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="My Societies" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Society Quick Access */}
        <View style={styles.section}>
          <SectionHeader title="My Societies" />
          {mySocieties.length === 0 ? (
            <View style={{ marginTop: theme.spacing.md }}>
              <Card>
                <EmptyState
                  icon="groups"
                  title="No societies yet"
                  subtitle="Join a society to see its events, announcements, and polls here"
                  actionLabel="Discover societies"
                  onAction={() => navigation.navigate('ExploreSocieties')}
                />
              </Card>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
              style={{ marginTop: theme.spacing.sm }}
            >
              {displayedSocieties.map((society) => {
                const isActive = activeSocietyId === society.id;
                const isFavourite = favouritedSocietyIds.includes(society.id);
                const role = roleForSociety(society.id);
                return (
                  <Card
                    key={society.id}
                    onPress={() => handleSocietyPress(society.id)}
                    style={[
                      styles.societyCard,
                      isActive ? { borderColor: theme.colors.primary, borderWidth: 2 } : null
                    ]}
                  >
                    <View style={styles.societyCardHeader}>
                      {isActive ? (
                        <BadgeChip label="Active" variant="primary" />
                      ) : (
                        <BadgeChip label={role} variant={roleChipVariant(role)} />
                      )}
                      <Pressable
                        onPress={() => toggleFavouriteSociety(society.id)}
                        hitSlop={10}
                      >
                        <MaterialIcons
                          name={isFavourite ? 'favorite' : 'favorite-border'}
                          size={18}
                          color={isFavourite ? theme.colors.danger : theme.colors.textTertiary}
                        />
                      </Pressable>
                    </View>
                    <Text
                      style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 10 }]}
                      numberOfLines={2}
                    >
                      {society.shortName}
                    </Text>
                    {isActive ? (
                      <View style={styles.societyCardFooter}>
                        <BadgeChip label={role} variant={roleChipVariant(role)} />
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleMakeActive(society)}
                        hitSlop={8}
                        style={({ pressed }) => [styles.makeActiveRow, { opacity: pressed ? 0.6 : 1 }]}
                      >
                        <MaterialIcons name="swap-horiz" size={16} color={theme.colors.primary} />
                        <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>
                          Make active
                        </Text>
                      </Pressable>
                    )}
                  </Card>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Pending memberships */}
        {pendingSocieties.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Pending Requests" />
            <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
              {pendingSocieties.map((society) => (
                <Card key={society.id} onPress={() => handleSocietyPress(society.id)}>
                  <View style={styles.pendingRow}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {society.name}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        Awaiting committee approval
                      </Text>
                    </View>
                    <BadgeChip label="Pending" variant="warning" />
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Feed filters */}
        {mySocieties.length > 0 && (
          <>
            <View style={styles.section}>
              <View style={styles.feedHeaderRow}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Feed</Text>
                <Pressable
                  onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  hitSlop={8}
                  style={({ pressed }) => [styles.favToggle, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <MaterialIcons
                    name={showFavoritesOnly ? 'favorite' : 'favorite-border'}
                    size={16}
                    color={showFavoritesOnly ? theme.colors.danger : theme.colors.textSecondary}
                  />
                  <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                    {showFavoritesOnly ? 'Favorites only' : 'Show all'}
                  </Text>
                </Pressable>
              </View>

              <FilterChips
                items={FEED_FILTERS}
                onChange={(selected) => setSelectedFilter(selected as FeedFilter)}
              />
            </View>

            {/* Feed Content */}
            <View style={{ paddingHorizontal: 20 }}>
              {filteredContent.length === 0 ? (
                <Card>
                  <EmptyState
                    icon="inbox"
                    title="No content yet"
                    subtitle="Join more societies or check back later for updates from your communities"
                    actionLabel="Explore societies"
                    onAction={() => navigation.navigate('ExploreSocieties')}
                  />
                </Card>
              ) : (
                <View style={{ gap: theme.spacing.lg }}>
                  {filteredContent.map((item, index) => {
                    if (item.type === 'event') {
                      return (
                        <View key={`event-${item.data.id}-${index}`}>
                          {item.societyName && (
                            <Text
                              style={[theme.typography.captionMedium, styles.feedSourceLabel, { color: theme.colors.textTertiary }]}
                              numberOfLines={1}
                            >
                              {item.societyName}
                            </Text>
                          )}
                          <EventCard
                            event={item.data}
                            onPressRSVP={() => handleEventPress(item.data.id)}
                          />
                        </View>
                      );
                    } else if (item.type === 'announcement') {
                      return (
                        <AnnouncementCard
                          key={`announcement-${item.data.id}-${index}`}
                          item={item.data}
                          onPress={() => handleAnnouncementPress(item.data.id)}
                        />
                      );
                    } else if (item.type === 'poll') {
                      return (
                        <Card key={`poll-${item.data.id}-${index}`} onPress={handlePollPress}>
                          {item.societyName && (
                            <Text
                              style={[theme.typography.captionMedium, styles.feedSourceLabel, { color: theme.colors.textTertiary }]}
                              numberOfLines={1}
                            >
                              {item.societyName}
                            </Text>
                          )}
                          <View style={styles.pollRow}>
                            <View style={[styles.pollIcon, { backgroundColor: theme.colors.primarySoft }]}>
                              <MaterialIcons name="poll" size={20} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
                                {item.data.question}
                              </Text>
                              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                                Tap to vote • {item.data.options.length} options
                              </Text>
                            </View>
                          </View>
                        </Card>
                      );
                    }
                    return null;
                  })}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 20
  },
  societyCard: {
    width: 168
  },
  societyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  societyCardFooter: {
    marginTop: 12
  },
  makeActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    minHeight: 24
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  favToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32
  },
  feedSourceLabel: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11
  },
  pollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  pollIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
