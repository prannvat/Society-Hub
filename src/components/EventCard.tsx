import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventItem } from '@/types';
import { BadgeChip } from './BadgeChip';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type EventCardProps = {
  event: EventItem;
  onPressRSVP?: (event: EventItem) => void;
};

export const EventCard = ({ event, onPressRSVP }: EventCardProps) => {
  const theme = useAppTheme();

  return (
    <Card>
      <View style={[styles.hero, { backgroundColor: theme.colors.border }]}>
        <View style={styles.heroTopRow}>
          <BadgeChip label={event.isFree ? 'Free' : 'Paid'} variant={event.isFree ? 'filled' : 'outlined'} />
          {event.membersOnly ? <BadgeChip label="Members" variant="outlined" /> : null}
        </View>
        <View style={styles.heroBottomRow}>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
            Hero image placeholder
          </Text>
        </View>
      </View>

      <View style={styles.metaWrap}>
        <Text style={{ color: theme.colors.textSecondary, fontWeight: '700' }} numberOfLines={1}>{event.date} • {event.time}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      
      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="View Event" onPress={() => onPressRSVP?.(event)} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  hero: {
    height: 170,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between'
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  heroBottomRow: {
    gap: 6
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  metaWrap: {
    marginTop: 14
  }
});
