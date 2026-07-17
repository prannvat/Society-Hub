import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TopNavBar } from '@/components/TopNavBar';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { MaterialIcons } from '@expo/vector-icons';
import { joinErrorMessage } from '@/services/api/memberships';
import { SocietyItem, EventItem, AnnouncementItem } from '@/types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExploreSocieties'>;

export const ExploreSocietiesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const { allSocieties, mySocietyIds, pendingMembershipSocietyIds, joinSociety, exploreEvents, loadExploreEvents, loadSocieties, announcements, profile } = useLocalAppState();

  useEffect(() => {
    loadSocieties().then(() => loadExploreEvents());
  }, [loadExploreEvents]);
  
  const [searchQuery, setSearchQuery] = useState('');


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

  const handleJoin = async (societyId: string, societyName: string) => {
    try {
      const result = await joinSociety(societyId);
      if (result === 'PENDING') {
        Alert.alert(
          'Membership Requested',
          `${societyName} requires approval to join. Your request is pending review by the committee.`,
        );
      } else {
        Alert.alert('Joined!', `You are now a member of ${societyName}.`, [
          { text: 'Awesome' }
        ]);
      }
    } catch (error) {
      Alert.alert('Join failed', joinErrorMessage(error));
    }
  };

  const renderSocietyCard = ({ item }: { item: SocietyItem }) => {
    const isMember = mySocietyIds.includes(item.id);
    const isPending = pendingMembershipSocietyIds.includes(item.id);
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })}
        style={[styles.societyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <View style={[styles.societyCardTop, { backgroundColor: item.primaryColor || theme.colors.primary }]} />
        <View style={styles.societyCardContent}>
          {item.logoUrl ? (
            <View style={[styles.societyLogo, { backgroundColor: '#FFF', borderColor: theme.colors.background, overflow: 'hidden' }]}>
              <Image source={{ uri: item.logoUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
          ) : (
            <View style={[styles.societyLogo, { backgroundColor: item.primaryColor, borderColor: theme.colors.background }]}>
              <Text style={styles.societyLogoText}>{item.shortName}</Text>
            </View>
          )}
          <Text style={[styles.societyTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.societySubtitle, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description || "Official University Society."}
          </Text>
          <View style={{ flex: 1 }} />
          {isPending ? (
            <View style={[styles.joinBtn, { backgroundColor: theme.colors.warning + '20' }]}>
              <Text style={[styles.joinBtnText, { color: theme.colors.warning }]}>Pending Approval</Text>
            </View>
          ) : !isMember ? (
            <TouchableOpacity
              onPress={() => handleJoin(item.id, item.name)}
              style={[styles.joinBtn, { backgroundColor: theme.colors.primary + '15' }]}
            >
              <Text style={[styles.joinBtnText, { color: theme.colors.primary }]}>Join Now</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('SocietyProfile', { societyId: item.id })}
              style={[styles.joinBtn, { backgroundColor: theme.colors.border }]}
            >
              <Text style={[styles.joinBtnText, { color: theme.colors.textPrimary }]}>View Page</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventCard = ({ item }: { item: EventItem }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      style={[styles.eventCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={[styles.eventImagePlaceholder, { backgroundColor: theme.colors.border }]}>
         <MaterialIcons name="event" size={32} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>{item.date} • {item.time}</Text>
        <View style={styles.eventFooter}>
          <MaterialIcons name="location-on" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.eventLocation, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAnnouncementItem = (item: AnnouncementItem, index: number) => (
    <TouchableOpacity 
      key={`ann-${index}`}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AnnouncementDetail', { announcementId: item.id })}
      style={[styles.announcementItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={styles.announcementHeader}>
        <View style={[styles.announcementBadge, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.announcementBadgeText, { color: theme.colors.primary }]}>{item.category}</Text>
        </View>
        <Text style={[styles.announcementTime, { color: theme.colors.textSecondary }]}>{item.timestamp}</Text>
      </View>
      <Text style={[styles.announcementTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.announcementPreview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {item.preview}
      </Text>
      <View style={styles.announcementFooter}>
        <MaterialIcons name="person" size={14} color={theme.colors.textSecondary} />
        <Text style={[styles.announcementAuthor, { color: theme.colors.textSecondary }]}>{item.authorName}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingBottom: 0 }}>
        <TopNavBar title="Explore" onBack={() => navigation.goBack()} />
        
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="search" size={22} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search societies, events & ads..."
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
               <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
               </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {searchQuery ? (
            <View style={styles.searchResults}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginLeft: 16 }]}>Events</Text>
              {filteredEvents.length === 0 ? (
                 <Text style={[styles.emptyText, { color: theme.colors.textSecondary, marginLeft: 16 }]}>No events found.</Text>
              ) : (
                 <FlatList 
                   data={filteredEvents}
                   keyExtractor={e => e.id}
                   renderItem={renderEventCard}
                   horizontal
                   showsHorizontalScrollIndicator={false}
                   contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 16, paddingTop: 12 }}
                   snapToInterval={280 + 16}
                   decelerationRate="fast"
                 />
              )}

              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginTop: 24, marginLeft: 16 }]}>Societies</Text>
              {filteredSocieties.length === 0 ? (
                 <Text style={[styles.emptyText, { color: theme.colors.textSecondary, marginLeft: 16 }]}>No societies found.</Text>
              ) : (
                 <FlatList 
                   data={filteredSocieties}
                   keyExtractor={s => s.id}
                   renderItem={renderSocietyCard}
                   horizontal
                   showsHorizontalScrollIndicator={false}
                   contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingTop: 12 }}
                   snapToInterval={220 + 16}
                   decelerationRate="fast"
                 />
              )}
            </View>
          ) : (
            <View style={styles.feedContainer}>
              {/* Featured Events */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Trending Events 🌟</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })}>
                   <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See all</Text>
                </TouchableOpacity>
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
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Discover Societies 🚀</Text>
              </View>
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

              {/* University Updates / Advertisements */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Campus Hub 📢</Text>
              </View>
              <View style={styles.verticalList}>
                {announcements.slice(0, 5).map((announcement, idx) => renderAnnouncementItem(announcement, idx))}
                <TouchableOpacity onPress={() => navigation.navigate('AnnouncementsFeed')} style={[styles.viewAllBtn, { borderColor: theme.colors.border }]}>
                  <Text style={[styles.viewAllBtnText, { color: theme.colors.textPrimary }]}>View All Notices</Text>
                </TouchableOpacity>
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
    marginTop: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchResults: {
    flex: 1,
  },
  feedContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },
  verticalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    width: 280,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  eventImagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocation: {
    fontSize: 13,
    flex: 1,
  },
  societyCard: {
    width: 220,
    height: 260,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  societyCardTop: {
    height: 80,
  },
  societyCardContent: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  societyLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    borderWidth: 4,
    marginBottom: 12,
  },
  societyLogoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  societyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  societySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  joinBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  joinBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  announcementItem: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  announcementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  announcementTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  announcementPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  announcementAuthor: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 15,
  },
  viewAllBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 8,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
