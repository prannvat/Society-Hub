import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, ScrollView, useWindowDimensions, Platform, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SearchBar } from '@/components/SearchBar';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ScreenLayout } from './ScreenLayout';

type DiscoveryFilter = 'All' | 'Events' | 'Societies' | 'Announcements';

export const HomeScreen = () => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentMode } = useUserRoles();
  const { 
    allSocieties, 
    exploreEvents, 
    announcements, 
    mySocietyIds,
    loadExploreEvents,
    isLoadingExplore
  } = useLocalAppState();
  
  const [selectedFilter, setSelectedFilter] = useState<DiscoveryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const eventCardWidth = Math.max(248, Math.min(320, width - 96));

  useEffect(() => {
    loadExploreEvents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExploreEvents();
    setRefreshing(false);
  };

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

  return (
    <ScreenLayout>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                University
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 4 }}>
                Discover
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('ExploreSocieties')}
              android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
              style={({ pressed }) => [
                { 
                  width: 44, 
                  height: 44, 
                  borderRadius: 22, 
                  backgroundColor: theme.colors.surface, 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                },
                { opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1 }
              ]}
            >
              <MaterialIcons name="search" size={24} color={theme.colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SearchBar
            placeholder="Search societies, events, and more..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginTop: 16 }}
          >
            {(['All', 'Events', 'Societies', 'Announcements'] as DiscoveryFilter[]).map((filter) => (
              <Pressable key={filter} onPress={() => setSelectedFilter(filter)}>
                <BadgeChip 
                  label={filter} 
                  variant={selectedFilter === filter ? 'filled' : 'outlined'} 
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        {!searchQuery && selectedFilter === 'All' && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionHeader title="Quick Actions" />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <Pressable
                onPress={() => navigation.navigate('ExploreSocieties')}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <MaterialIcons name="explore" size={28} color={theme.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 8 }}>
                  Browse
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  All Societies
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <MaterialIcons name="event" size={28} color={theme.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 8 }}>
                  Events
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  This Week
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('CreateSociety')}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <MaterialIcons name="add-circle-outline" size={28} color={theme.colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginTop: 8 }}>
                  Create
                </Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  New Society
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Popular Societies */}
        {!searchQuery && selectedFilter === 'All' && popularSocieties.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader title="Popular Societies" rightText="See all" onPressRight={() => navigation.navigate('ExploreSocieties')} />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              style={{ marginTop: 12 }}
            >
              {popularSocieties.map((society) => (
                <Pressable
                  key={society.id}
                  onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}
                  style={{
                    width: 160,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 }}>
                    {society.shortName}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 18 }} numberOfLines={2}>
                    {society.description || society.name}
                  </Text>
                  <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialIcons name="groups" size={14} color={theme.colors.textSecondary} />
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                      {society._count?.memberships || 0} members
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upcoming Events */}
        {(selectedFilter === 'All' || selectedFilter === 'Events') && filteredEvents.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader 
                title="Upcoming Events" 
                rightText="See all" 
                onPressRight={() => navigation.navigate('MainTabs', { screen: 'Events' })} 
              />
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              style={{ marginTop: 12 }}
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

        {/* Societies Grid (when filtering) */}
        {(selectedFilter === 'Societies' || searchQuery) && filteredSocieties.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionHeader title="Societies" />
            <View style={{ marginTop: 12, gap: 12 }}>
              {filteredSocieties.slice(0, searchQuery ? 20 : 6).map((society) => (
                <Pressable
                  key={society.id}
                  onPress={() => navigation.navigate('SocietyProfile', { societyId: society.id })}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
                      {society.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
                      {society.description}
                    </Text>
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="groups" size={14} color={theme.colors.textSecondary} />
                      <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                        {society._count?.memberships || 0} members
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Latest Announcements */}
        {(selectedFilter === 'All' || selectedFilter === 'Announcements') && filteredAnnouncements.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionHeader 
              title="Latest News" 
              rightText="See all" 
              onPressRight={() => navigation.navigate('AnnouncementsFeed')} 
            />
            <View style={{ marginTop: 12, gap: 16 }}>
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

        {/* Empty States */}
        {searchQuery && 
         filteredSocieties.length === 0 && 
         filteredEvents.length === 0 && 
         filteredAnnouncements.length === 0 && (
          <View style={{ paddingHorizontal: 20, alignItems: 'center', paddingVertical: 40 }}>
            <MaterialIcons name="search-off" size={48} color={theme.colors.textSecondary} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: theme.colors.textPrimary, 
              marginTop: 12 
            }}>
              No results found
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: theme.colors.textSecondary, 
              textAlign: 'center',
              marginTop: 4
            }}>
              Try adjusting your search or explore all societies
            </Text>
            <View style={{ marginTop: 16 }}>
              <OutlineButton 
                label="Browse All Societies" 
                onPress={() => navigation.navigate('ExploreSocieties')} 
              />
            </View>
          </View>
        )}

        {!searchQuery && selectedFilter === 'All' && allSocieties.length === 0 && (
          <View style={{ paddingHorizontal: 20, alignItems: 'center', paddingVertical: 40 }}>
            <MaterialIcons name="explore" size={48} color={theme.colors.textSecondary} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: theme.colors.textPrimary, 
              marginTop: 12 
            }}>
              Welcome to SocietyHub
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: theme.colors.textSecondary, 
              textAlign: 'center',
              marginTop: 4,
              marginHorizontal: 20
            }}>
              Discover societies, events, and connect with your university community
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};
