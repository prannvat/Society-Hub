import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from './ScreenLayout';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EventCard } from '@/components/EventCard';
import { RootStackParamList } from '@/navigation/types';
import { MaterialIcons } from '@expo/vector-icons';

type FilterMode = 'ALL' | 'WEEK' | number;

const generateDays = () => {
  const days: { index: number; label: string; number: string; date: Date }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      index: i,
      label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      number: d.getDate().toString(),
      date: d,
    });
  }
  return days;
};

export const ExploreScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { exploreEvents, loadExploreEvents, isLoadingExplore, favouritedSocietyIds, toggleFavouriteSociety } = useLocalAppState();
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);
  
  const days = useMemo(() => generateDays(), []);

  useEffect(() => {
    loadExploreEvents();
  }, [loadExploreEvents]);

  const filteredEvents = useMemo(() => {
    let sourceEvents = exploreEvents;
    
    if (showOnlyFavourites) {
      sourceEvents = exploreEvents.filter(ev => favouritedSocietyIds.includes(ev.societyId));
    }

    if (filterMode === 'ALL') return sourceEvents;
    
    if (filterMode === 'WEEK') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      return sourceEvents.filter(ev => {
        if (!ev.startAtIso) return false;
        const evDate = new Date(ev.startAtIso);
        return evDate.getTime() >= today.getTime() && evDate.getTime() < nextWeek.getTime();
      });
    }

    const targetDate = days[filterMode].date;
    return sourceEvents.filter(ev => {
      if (!ev.startAtIso) return false;
      const evDate = new Date(ev.startAtIso);
      evDate.setHours(0, 0, 0, 0);
      return evDate.getTime() === targetDate.getTime();
    });
  }, [exploreEvents, showOnlyFavourites, favouritedSocietyIds, filterMode, days]);

  return (
    <ScreenLayout>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Explore</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Discover events across all societies
            </Text>
          </View>
          <Pressable 
            onPress={() => setShowOnlyFavourites(!showOnlyFavourites)}
            style={[
              styles.favFilterButton,
              { 
                backgroundColor: showOnlyFavourites ? `${theme.colors.primary}1A` : 'transparent',
                borderColor: showOnlyFavourites ? theme.colors.primary : theme.colors.border
              }
            ]}
          >
            <MaterialIcons 
              name={showOnlyFavourites ? "favorite" : "favorite-border"} 
              size={20} 
              color={showOnlyFavourites ? theme.colors.primary : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.favFilterText, 
              { color: showOnlyFavourites ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              {showOnlyFavourites ? 'Favourites' : 'All'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.calendarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          <Pressable
            onPress={() => setFilterMode('ALL')}
            style={[
              styles.dayCard,
              {
                backgroundColor: filterMode === 'ALL' ? theme.colors.primary : theme.colors.surface,
                borderColor: filterMode === 'ALL' ? theme.colors.primary : theme.colors.border,
              }
            ]}
          >
            <Text style={[styles.dayLabel, { color: filterMode === 'ALL' ? theme.colors.background : theme.colors.textSecondary }]}>Show</Text>
            <Text style={[styles.dayNumber, { color: filterMode === 'ALL' ? theme.colors.background : theme.colors.textPrimary }]}>All</Text>
          </Pressable>

          <Pressable
            onPress={() => setFilterMode('WEEK')}
            style={[
              styles.dayCard,
              {
                backgroundColor: filterMode === 'WEEK' ? theme.colors.primary : theme.colors.surface,
                borderColor: filterMode === 'WEEK' ? theme.colors.primary : theme.colors.border,
              }
            ]}
          >
            <Text style={[styles.dayLabel, { color: filterMode === 'WEEK' ? theme.colors.background : theme.colors.textSecondary }]}>This</Text>
            <Text style={[styles.dayNumber, { fontSize: 16, color: filterMode === 'WEEK' ? theme.colors.background : theme.colors.textPrimary }]}>Week</Text>
          </Pressable>

          {days.map((day, idx) => {
            const isSelected = filterMode === idx;
            return (
              <Pressable
                key={idx}
                onPress={() => setFilterMode(idx)}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  }
                ]}
              >
                <Text style={[
                  styles.dayLabel,
                  { color: isSelected ? theme.colors.background : theme.colors.textSecondary }
                ]}>
                  {day.label}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: isSelected ? theme.colors.background : theme.colors.textPrimary }
                ]}>
                  {day.number}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.feed}
        refreshControl={
          <RefreshControl refreshing={isLoadingExplore} onRefresh={loadExploreEvents} tintColor={theme.colors.primary} />
        }
      >
        {isLoadingExplore && exploreEvents.length === 0 ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const isFavourited = favouritedSocietyIds.includes(event.societyId);
            return (
              <View key={event.id} style={styles.eventWrap}>
                <View style={styles.societyBadgeRow}>
                  <View style={styles.societyBadge}>
                    <MaterialIcons name="school" size={16} color={theme.colors.primary} />
                    <Text style={[styles.societyName, { color: theme.colors.primary }]}>
                      {event.societyName ?? 'University Society'}
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => toggleFavouriteSociety(event.societyId)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons 
                      name={isFavourited ? "favorite" : "favorite-border"} 
                      size={20} 
                      color={isFavourited ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                  </Pressable>
                </View>
                <EventCard
                  event={event}
                  onPressRSVP={(ev) => navigation.navigate('EventDetail', { eventId: ev.id })}
                />
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color={theme.colors.border} />
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No events found</Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              There are no events on this date. Try selecting another day or "All".
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitles: {
    flex: 1,
  },
  favFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  favFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  calendarWrap: {
    marginBottom: 16,
  },
  calendarScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayCard: {
    width: 64,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  feed: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24,
  },
  eventWrap: {
    gap: 8,
  },
  societyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  societyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  societyName: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  }
});