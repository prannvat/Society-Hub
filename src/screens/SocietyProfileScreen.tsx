import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text, View, Pressable, ScrollView, Linking, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EventCard } from '@/components/EventCard';
import { EventItem } from '@/types';
import { fetchEvents } from '@/services/api/events';
import { fetchSocietyProfile } from '@/services/api/societies';


const mapEvent = (event: any): EventItem => {
  const start = new Date(event.startAt);
  return {
    id: event.id,
    societyId: event.societyId,
    title: event.title,
    description: event.description,
    date: start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    startAtIso: event.startAt,
    endAtIso: event.endAt ?? null,
    location: event.location,
    locationPlaceId: event.locationPlaceId ?? undefined,
    locationLatitude: event.locationLatitude ?? undefined,
    locationLongitude: event.locationLongitude ?? undefined,
    posterImageUrl: event.posterImageUrl ?? undefined,
    isFree: event.isFree,
    membersOnly: event.membersOnly,
    isRsvpedByCurrentUser: event.isRsvpedByCurrentUser,
    attendingCount: event._count?.rsvps || 0,
  };
};

export const SocietyProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SocietyProfile'>>();
  const { allSocieties, favouritedSocietyIds, toggleFavouriteSociety } = useLocalAppState();
  
  const [localSociety, setLocalSociety] = useState<any>(null);
  const [societyEvents, setSocietyEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to memory if offline/loading
  const memoizedSociety = allSocieties.find((entry) => entry.id === route.params?.societyId) ?? allSocieties[0];
  const society = localSociety || memoizedSociety;

  const isFavourited = society ? favouritedSocietyIds.includes(society.id) : false;

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        const [prof, evts] = await Promise.all([
          fetchSocietyProfile(route.params!.societyId!).catch(() => null),
          fetchEvents(route.params!.societyId!).catch(() => [])
        ]);
        if (prof) setLocalSociety(prof);
        if (evts) setSocietyEvents(evts.map(mapEvent));
      } catch (err) {
        console.error('Failed to load detail profile', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (route.params?.societyId) {
      loadProfileData();
    }
  }, [route.params?.societyId]);

  const now = new Date();
  const { upcomingEvents, pastEvents } = useMemo(() => {
    return societyEvents.reduce((acc, ev) => {
      const eventDate = ev.startAtIso ? new Date(ev.startAtIso) : new Date(ev.date + ' ' + ev.time);
      if (eventDate >= now) acc.upcomingEvents.push(ev);
      else acc.pastEvents.push(ev);
      return acc;
    }, { upcomingEvents: [] as EventItem[], pastEvents: [] as EventItem[] });
  }, [societyEvents]);

  if (!society && !isLoading) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Society not found</Text>
          <OutlineButton label="Back" onPress={() => navigation.goBack()} />
        </View>
      </ScreenLayout>
    );
  }

  const handleOpenLink = async (url?: string | null) => {
    if (url && (await Linking.canOpenURL(url))) {
      Linking.openURL(url);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 100, gap: 24 }}>
        <View style={{ borderRadius: 14, padding: 16, backgroundColor: society.primaryColor, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
              {society.logoUrl ? (
                <Image source={{ uri: society.logoUrl }} style={styles.logo} />
              ) : (
                <View style={[styles.fallbackLogo, { backgroundColor: society.secondaryColor }]}>
                  <Text style={styles.fallbackLogoText}>{society.shortName}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }} numberOfLines={2}>{society.name}</Text>
                <Text style={{ color: '#FFFFFF', marginTop: 4 }}>{society.university}</Text>
              </View>
            </View>
            <Pressable 
              onPress={() => toggleFavouriteSociety(society.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 4 }}
            >
              <MaterialIcons 
                name={isFavourited ? "favorite" : "favorite-border"} 
                size={28} 
                color="#FFFFFF" 
              />
            </Pressable>
          </View>
          
          <View style={styles.socialRow}>
            {society.instagramLink && (
              <Pressable onPress={() => handleOpenLink(society.instagramLink)} style={styles.socialIcon}>
                <FontAwesome name="instagram" size={24} color="#FFFFFF" />
              </Pressable>
            )}
            {society.whatsappLink && (
              <Pressable onPress={() => handleOpenLink(society.whatsappLink)} style={styles.socialIcon}>
                <FontAwesome name="whatsapp" size={24} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>About</Text>
          <Text style={{ color: theme.colors.textSecondary, lineHeight: 22 }}>
            {society.description || 'A student-run community focused on belonging, events, and peer support.'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="All Events" onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })} />
          </View>
          <View style={{ flex: 1 }}>
            <OutlineButton label="Open Polls" onPress={() => navigation.navigate('MainTabs', { screen: 'Polls' })} />
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {society.affiliatedUniversities && society.affiliatedUniversities.length > 1 && (
            <BadgeChip label="Joint Society" variant="filled" />
          )}
          {society.joinPolicy === 'VERIFIED_STUDENTS_ONLY' && (
             <BadgeChip label="Verified Students Only" variant="outlined" />
          )}
          {society.joinPolicy === 'OPEN' && (
             <BadgeChip label="Open to All" variant="outlined" />
          )}
          {society.joinPolicy === 'APPROVAL_REQUIRED' && (
             <BadgeChip label="Approval Required" variant="outlined" />
          )}
          <BadgeChip label="Announcements" variant="outlined" />
          <BadgeChip label="Member Directory" variant="outlined" />
          <BadgeChip label="Committee Polls" variant="outlined" />
        </View>


        {(upcomingEvents.length > 0 || pastEvents.length > 0) && <View style={styles.divider} />}

        {upcomingEvents.length > 0 && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Upcoming Events</Text>
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} onPressRSVP={() => navigation.navigate('EventDetail', { eventId: event.id })} />
            ))}
          </View>
        )}

        {pastEvents.length > 0 && (
           <View style={{ gap: 16 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Past Events</Text>
            <View style={{ opacity: 0.6 }}>
              {pastEvents.map(event => (
                <View key={event.id} style={{ marginBottom: 12 }}>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>{event.title}</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{event.date}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  logo: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF' },
  fallbackLogo: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  fallbackLogoText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  socialRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  socialIcon: { padding: 4 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 }
});
