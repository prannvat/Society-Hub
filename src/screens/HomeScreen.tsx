import React from 'react';
import { Pressable, Text, View, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export const HomeScreen = () => {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSocietyId, cycleSociety, events, announcements, isAdminMode, allSocieties, activeSocietyRole } = useLocalAppState();
  const activeSociety = allSocieties.find((society) => society.id === activeSocietyId) ?? allSocieties[0];
  const eventCardWidth = Math.max(248, Math.min(320, width - 96));

  const societyActions = [
    {
      title: isAdminMode ? 'Create Event' : 'Explore Campus',
      subtitle: isAdminMode ? 'Publish a new committee event' : 'Discover societies, events & updates',
      icon: isAdminMode ? 'add-circle-outline' : 'explore',
      onPress: () => navigation.navigate(isAdminMode ? 'CreateEvent' : 'ExploreSocieties')
    },
    {
      title: 'Start a Society',
      subtitle: 'Submit a new society request',
      icon: 'apartment',
      onPress: () => navigation.navigate('CreateSociety')
    }
  ] as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: 96 }}>
      {/* Header Section */}
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>{activeSociety.shortName}</Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 4 }}>Discover</Text>
          </View>
          <Pressable
            onPress={cycleSociety}
            android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: true }}
            style={({ pressed }) => [
              { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
              { opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1 }
            ]}
          >
            <MaterialIcons name="swap-horiz" size={24} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Admin Quick Banner */}
      {isAdminMode && (
        <Pressable 
          onPress={() => navigation.navigate('AdminDashboard')}
          android_ripple={{ color: 'rgba(255,255,255,0.22)', borderless: false }}
          style={({ pressed }) => [
            { marginHorizontal: 20, marginBottom: 24, padding: 16, borderRadius: 16, backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
            { opacity: pressed && Platform.OS === 'ios' ? 0.92 : 1 }
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="admin-panel-settings" size={20} color={theme.colors.background} />
            </View>
            <View>
              <Text style={{ color: theme.colors.background, fontWeight: '800', fontSize: 16 }}>Committee Hub</Text>
              <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 2 }}>Manage events, members, and polls</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.background} />
        </Pressable>
      )}

      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <GlassCard
          style={{
            shadowColor: theme.shadow.shadowColor,
            shadowOffset: theme.shadow.shadowOffset,
            shadowOpacity: theme.shadow.shadowOpacity,
            shadowRadius: theme.shadow.shadowRadius,
            elevation: theme.shadow.elevation
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Current access</Text>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
              {activeSocietyRole} in {activeSociety.shortName}. Presidents can manage roles, Committee can run events and polls.
            </Text>
          </View>
        </GlassCard>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 26, gap: 12 }}>
        <SectionHeader title="Quick Start" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {societyActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={action.onPress}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 14,
                padding: 14,
                backgroundColor: theme.colors.surface,
                gap: 8
              }}
            >
              <MaterialIcons name={action.icon} size={22} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{action.title}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }} numberOfLines={2}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recommended Events (Horizontal Scroll) */}
      <View style={{ paddingHorizontal: 20 }}>
        <SectionHeader title="Upcoming" rightText="See all" onPressRight={() => navigation.navigate('MainTabs', { screen: 'Events' })} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 10 }}>
        {events.slice(0, 4).map((event) => (
          <View key={event.id} style={{ width: eventCardWidth }}>
            <EventCard event={event} onPressRSVP={(selectedEvent) => navigation.navigate('EventDetail', { eventId: selectedEvent.id })} />
          </View>
        ))}
      </ScrollView>

      {/* Announcements */}
      <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 16 }}>
        <SectionHeader title="Latest News" rightText="See all" onPressRight={() => navigation.navigate('AnnouncementsFeed')} />
        {announcements.slice(0, 3).map((item) => (
          <AnnouncementCard key={item.id} item={item} onPress={(selectedAnnouncement) => navigation.navigate('AnnouncementDetail', { announcementId: selectedAnnouncement.id })} />
        ))}
      </View>
    </ScrollView>
  );
};
