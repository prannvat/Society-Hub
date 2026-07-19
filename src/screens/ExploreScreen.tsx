import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from './ScreenLayout';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { EventCard } from '@/components/EventCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { RootStackParamList } from '@/navigation/types';
import { MaterialIcons } from '@expo/vector-icons';
import { EventItem } from '@/types';

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

type EventGroup = {
  key: string;
  title: string;
  caption?: string;
  events: EventItem[];
};

const groupEventsByDay = (events: EventItem[]): EventGroup[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const groups = new Map<string, EventGroup>();
  const undated: EventItem[] = [];

  events.forEach((event) => {
    if (!event.startAtIso) {
      undated.push(event);
      return;
    }
    const eventDate = new Date(event.startAtIso);
    if (Number.isNaN(eventDate.getTime())) {
      undated.push(event);
      return;
    }
    const day = new Date(eventDate);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString();
    const existing = groups.get(key);
    if (existing) {
      existing.events.push(event);
      return;
    }
    const title =
      day.getTime() === today.getTime()
        ? 'Today'
        : day.getTime() === tomorrow.getTime()
          ? 'Tomorrow'
          : day.toLocaleDateString('en-US', { weekday: 'long' });
    groups.set(key, {
      key,
      title,
      caption: day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      events: [event]
    });
  });

  const sorted = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
  if (undated.length > 0) {
    sorted.push({ key: 'undated', title: 'Date to be announced', events: undated });
  }
  return sorted;
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

  const groupedEvents = useMemo(() => groupEventsByDay(filteredEvents), [filteredEvents]);

  const renderDayChip = (
    selected: boolean,
    onPress: () => void,
    label: string,
    value: string,
    key: string | number
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCard,
        {
          borderRadius: theme.radius.lg,
          backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          transform: [{ scale: pressed ? 0.97 : 1 }]
        }
      ]}
    >
      <Text
        style={[
          theme.typography.caption,
          { fontWeight: '700', color: selected ? theme.colors.textOnPrimary : theme.colors.textSecondary }
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          theme.typography.h3,
          { color: selected ? theme.colors.textOnPrimary : theme.colors.textPrimary }
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.header}>
        <ScreenHeader
          title="Events"
          subtitle="What's on across campus"
          accessory={
            <Pressable
              onPress={() => setShowOnlyFavourites(!showOnlyFavourites)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.favFilterButton,
                {
                  borderRadius: theme.radius.pill,
                  backgroundColor: showOnlyFavourites ? theme.colors.primarySoft : 'transparent',
                  borderColor: showOnlyFavourites ? theme.colors.primary : theme.colors.border,
                  opacity: pressed ? 0.7 : 1
                }
              ]}
            >
              <MaterialIcons
                name={showOnlyFavourites ? 'favorite' : 'favorite-border'}
                size={18}
                color={showOnlyFavourites ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  theme.typography.captionMedium,
                  { color: showOnlyFavourites ? theme.colors.primary : theme.colors.textSecondary }
                ]}
              >
                {showOnlyFavourites ? 'Favourites' : 'All'}
              </Text>
            </Pressable>
          }
        />
      </View>

      <View style={styles.calendarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {renderDayChip(filterMode === 'ALL', () => setFilterMode('ALL'), 'Show', 'All', 'all')}
          {renderDayChip(filterMode === 'WEEK', () => setFilterMode('WEEK'), 'This', 'Week', 'week')}
          {days.map((day, idx) =>
            renderDayChip(filterMode === idx, () => setFilterMode(idx), day.label, day.number, idx)
          )}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.feed}
        refreshControl={
          <RefreshControl refreshing={isLoadingExplore} onRefresh={loadExploreEvents} tintColor={theme.colors.primary} />
        }
      >
        {isLoadingExplore && exploreEvents.length === 0 ? (
          <View style={{ gap: 12 }}>
            {[0, 1, 2].map((index) => (
              <Card key={index}>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <Skeleton width={56} height={56} radius={theme.radius.card} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton width="75%" height={16} />
                    <Skeleton width="50%" height={12} />
                    <Skeleton width="40%" height={12} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : groupedEvents.length > 0 ? (
          groupedEvents.map((group) => (
            <View key={group.key} style={styles.groupWrap}>
              <View style={styles.groupHeader}>
                <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{group.title}</Text>
                {group.caption ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>{group.caption}</Text>
                ) : null}
              </View>
              {group.events.map((event) => {
                const isFavourited = favouritedSocietyIds.includes(event.societyId);
                return (
                  <View key={event.id} style={styles.eventWrap}>
                    <View style={styles.societyBadgeRow}>
                      <View style={styles.societyBadge}>
                        <MaterialIcons name="school" size={14} color={theme.colors.primary} />
                        <Text
                          style={[theme.typography.captionMedium, styles.societyName, { color: theme.colors.primary }]}
                          numberOfLines={1}
                        >
                          {event.societyName ?? 'University Society'}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => toggleFavouriteSociety(event.societyId)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialIcons
                          name={isFavourited ? 'favorite' : 'favorite-border'}
                          size={20}
                          color={isFavourited ? theme.colors.danger : theme.colors.textTertiary}
                        />
                      </Pressable>
                    </View>
                    <EventCard
                      event={event}
                      onPressRSVP={(ev) => navigation.navigate('EventDetail', { eventId: ev.id })}
                    />
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <EmptyState
            icon="event-busy"
            title="No events found"
            subtitle={
              showOnlyFavourites
                ? 'No upcoming events from your favourite societies. Try showing all events.'
                : 'There are no events on this date. Try selecting another day or "All".'
            }
            actionLabel={filterMode !== 'ALL' || showOnlyFavourites ? 'Show all events' : undefined}
            onAction={() => {
              setFilterMode('ALL');
              setShowOnlyFavourites(false);
            }}
          />
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20
  },
  favFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minHeight: 36,
    borderWidth: 1,
    gap: 6
  },
  calendarWrap: {
    marginBottom: 16
  },
  calendarScroll: {
    paddingHorizontal: 20,
    gap: 12
  },
  dayCard: {
    width: 64,
    height: 72,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  feed: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24
  },
  groupWrap: {
    gap: 14
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8
  },
  eventWrap: {
    gap: 8
  },
  societyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  societyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    flexShrink: 1
  },
  societyName: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
    flexShrink: 1
  }
});
