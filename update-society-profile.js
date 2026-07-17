const fs = require('fs');

const path = 'src/screens/SocietyProfileScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const importReplacement = `import React, { useMemo, useState, useEffect } from 'react';
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
import { fetchSocietyProfile } from '@/services/api/societies';`;

content = content.replace(/import React, { useMemo } from 'react';[\s\S]*?import { EventCard } from '@\/components\/EventCard';/, importReplacement);

const fetchFunction = `
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
          fetchSocietyProfile(route.params.societyId).catch(() => null),
          fetchEvents(route.params.societyId).catch(() => [])
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

  if (!society && !isLoading) {`;

content = content.replace(/export const SocietyProfileScreen = \(\) => {[\s\S]*?if \(!society\) {/, fetchFunction);

fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
