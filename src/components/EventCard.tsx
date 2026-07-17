import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EventItem } from '@/types';
import { BadgeChip } from './BadgeChip';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type EventCardProps = {
  event: EventItem;
  onPressRSVP?: (event: EventItem) => void;
};

const parseEventDate = (event: EventItem): Date | null => {
  if (event.startAtIso) {
    const parsed = new Date(event.startAtIso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  const fallback = new Date(event.date);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const EventCard = ({ event, onPressRSVP }: EventCardProps) => {
  const theme = useAppTheme();
  const hasPoster = typeof event.posterImageUrl === 'string' && /^https?:\/\//i.test(event.posterImageUrl);
  const eventDate = parseEventDate(event);
  const isGoing = event.isRsvpedByCurrentUser === true;

  return (
    <Card onPress={onPressRSVP ? () => onPressRSVP(event) : undefined}>
      {hasPoster ? (
        <Image
          source={{ uri: event.posterImageUrl }}
          style={[styles.poster, { borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceSunken }]}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.mainRow}>
        <View style={[styles.dateBlock, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.card }]}>
          {eventDate ? (
            <>
              <Text style={[theme.typography.h2, { color: theme.colors.primary }]}>{eventDate.getDate()}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>
                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </>
          ) : (
            <MaterialIcons name="event" size={24} color={theme.colors.primary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {event.title}
          </Text>
          {event.societyName ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="groups" size={14} color={theme.colors.textTertiary} />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
                {event.societyName}
              </Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={14} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={14} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {event.time}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.chipGroup}>
          <BadgeChip label={event.isFree ? 'Free' : 'Paid'} variant={event.isFree ? 'success' : 'neutral'} />
          {event.membersOnly ? <BadgeChip label="Members" variant="primary" /> : null}
        </View>
        <View style={styles.footerRight}>
          <View style={styles.metaRow}>
            <MaterialIcons name="people-outline" size={15} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
              {event.attendingCount}
            </Text>
          </View>
          <View
            style={[
              styles.rsvpChip,
              {
                borderRadius: theme.radius.pill,
                backgroundColor: isGoing ? theme.colors.successSoft : theme.colors.primarySoft
              }
            ]}
          >
            {isGoing ? <MaterialIcons name="check" size={14} color={theme.colors.success} /> : null}
            <Text
              style={[
                theme.typography.captionMedium,
                { color: isGoing ? theme.colors.success : theme.colors.primary, fontSize: 12 }
              ]}
            >
              {isGoing ? 'Going' : 'View'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  poster: {
    width: '100%',
    height: 140,
    marginBottom: 14
  },
  mainRow: {
    flexDirection: 'row',
    gap: 14
  },
  dateBlock: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  info: {
    flex: 1,
    gap: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 1
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  rsvpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 30,
    paddingHorizontal: 12,
    paddingVertical: 6
  }
});
