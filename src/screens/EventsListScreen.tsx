import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventCard } from '@/components/EventCard';
import { Card } from '@/components/Card';
import { FilterChips } from '@/components/FilterChips';
import { TopNavBar } from '@/components/TopNavBar';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const EventsListScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { events, isAdminMode, activeSocietyRole } = useLocalAppState();
  const [activeFilter, setActiveFilter] = React.useState('All');

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();

    if (activeFilter === 'This Week') {
      const inSevenDays = new Date(now);
      inSevenDays.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= inSevenDays;
    }

    if (activeFilter === 'This Month') {
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }

    if (activeFilter === 'Free') {
      return event.isFree;
    }

    if (activeFilter === 'Members Only') {
      return event.membersOnly;
    }

    return true;
  });

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 96, gap: 16 }}>
        <TopNavBar title="Events" />
        {isAdminMode ? (
          <Pressable
            onPress={() => navigation.navigate('CreateEvent')}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              backgroundColor: `${theme.colors.primary}14`,
              padding: 14,
              gap: 4
            }}
          >
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '800', fontSize: 16 }}>Create Event</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Committee shortcut: publish an event in one tap.</Text>
          </Pressable>
        ) : (
          <Card>
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>Event publishing access</Text>
              <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
                Your current role is {activeSocietyRole}. Committee and Presidents can publish events.
              </Text>
            </View>
          </Card>
        )}
        <FilterChips items={['All', 'This Week', 'This Month', 'Free', 'Members Only']} onChange={setActiveFilter} />

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onPressRSVP={(selectedEvent) => navigation.navigate('EventDetail', { eventId: selectedEvent.id })} />
          ))
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Ionicons name="calendar-outline" size={48} color={theme.colors.border} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 16 }}>
              No events found
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
              Try adjusting your filters or check back later!
            </Text>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};
