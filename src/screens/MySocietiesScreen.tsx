import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { EventCard } from '@/components/EventCard';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { ScreenLayout } from './ScreenLayout';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';

type FeedFilter = 'All' | 'Events' | 'Announcements' | 'Polls';

export const MySocietiesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { 
    mySocietyIds, 
    allSocieties, 
    events, 
    announcements, 
    polls,
    activeSocietyId,
    setActiveSocietyId,
    favouritedSocietyIds,
    toggleFavouriteSociety
  } = useLocalAppState();
  
  const [selectedFilter, setSelectedFilter] = useState<FeedFilter>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const mySocieties = allSocieties.filter(society => mySocietyIds.includes(society.id));
  const displayedSocieties = showFavoritesOnly 
    ? mySocieties.filter(society => favouritedSocietyIds.includes(society.id))
    : mySocieties;

  const handleSocietyPress = (societyId: string) => {
    navigation.navigate('SocietyProfile', { societyId });
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
    <ScreenLayout>
      <TopNavBar 
        title="My Societies" 
        showBackButton={false}
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Society Quick Access */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <SectionHeader title="My Societies" />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            style={{ marginTop: 8 }}
          >
            {displayedSocieties.map((society) => (
              <Pressable
                key={society.id}
                onPress={() => handleSocietyPress(society.id)}
                style={{
                  padding: 16,
                  backgroundColor: activeSocietyId === society.id ? theme.colors.primary : theme.colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  minWidth: 120,
                  alignItems: 'center',
                }}
              >
                <Text 
                  style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: activeSocietyId === society.id ? theme.colors.background : theme.colors.textPrimary,
                    textAlign: 'center'
                  }}
                  numberOfLines={2}
                >
                  {society.shortName}
                </Text>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavouriteSociety(society.id);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <MaterialIcons 
                    name={favouritedSocietyIds.includes(society.id) ? 'favorite' : 'favorite-border'} 
                    size={16} 
                    color={favouritedSocietyIds.includes(society.id) ? '#EF4444' : theme.colors.textSecondary} 
                  />
                </Pressable>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Filters */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
              Feed
            </Text>
            <Pressable
              onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <MaterialIcons 
                name={showFavoritesOnly ? 'favorite' : 'favorite-border'} 
                size={16} 
                color={showFavoritesOnly ? '#EF4444' : theme.colors.textSecondary} 
              />
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                {showFavoritesOnly ? 'Favorites Only' : 'Show All'}
              </Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginBottom: 16 }}
          >
            {(['All', 'Events', 'Announcements', 'Polls'] as FeedFilter[]).map((filter) => (
              <Pressable key={filter} onPress={() => setSelectedFilter(filter)}>
                <BadgeChip 
                  label={filter} 
                  variant={selectedFilter === filter ? 'filled' : 'outlined'} 
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Feed Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {filteredContent.length === 0 ? (
            <View style={{ 
              alignItems: 'center', 
              paddingVertical: 40,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <MaterialIcons name="inbox" size={48} color={theme.colors.textSecondary} />
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.colors.textPrimary, 
                marginTop: 12 
              }}>
                No content yet
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: theme.colors.textSecondary, 
                textAlign: 'center',
                marginTop: 4,
                marginHorizontal: 20
              }}>
                Join more societies or check back later for updates from your communities
              </Text>
              <View style={{ marginTop: 16 }}>
                <OutlineButton 
                  label="Explore Societies" 
                  onPress={() => navigation.navigate('ExploreSocieties')} 
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {filteredContent.map((item, index) => {
                if (item.type === 'event') {
                  return (
                    <View key={`event-${item.data.id}-${index}`}>
                      {item.societyName && (
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '600', 
                          color: theme.colors.textSecondary,
                          marginBottom: 4
                        }}>
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
                    <Pressable
                      key={`poll-${item.data.id}-${index}`}
                      onPress={handlePollPress}
                      style={{
                        padding: 16,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      {item.societyName && (
                        <Text style={{ 
                          fontSize: 12, 
                          fontWeight: '600', 
                          color: theme.colors.textSecondary,
                          marginBottom: 8
                        }}>
                          {item.societyName}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <MaterialIcons name="poll" size={24} color={theme.colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            fontSize: 16, 
                            fontWeight: '600', 
                            color: theme.colors.textPrimary 
                          }}>
                            {item.data.question}
                          </Text>
                          <Text style={{ 
                            fontSize: 14, 
                            color: theme.colors.textSecondary,
                            marginTop: 2
                          }}>
                            Tap to vote • {item.data.options.length} options
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                }
                return null;
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};