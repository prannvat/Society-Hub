import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
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
  const hasPoster = typeof event.posterImageUrl === 'string' && /^https?:\/\//i.test(event.posterImageUrl);
  const hasCoords = typeof event.locationLatitude === 'number' && typeof event.locationLongitude === 'number';

  return (
    <Card>
      <View style={[styles.hero, { backgroundColor: theme.colors.border }]}> 
        {hasPoster ? (
          <Image source={{ uri: event.posterImageUrl }} style={styles.heroMedia} resizeMode="cover" />
        ) : hasCoords ? (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.heroMedia}
            initialRegion={{
              latitude: event.locationLatitude!,
              longitude: event.locationLongitude!,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={{ latitude: event.locationLatitude!, longitude: event.locationLongitude! }} />
          </MapView>
        ) : null}
        <View style={styles.heroTopRow}>
          <BadgeChip label={event.isFree ? 'Free' : 'Paid'} variant={event.isFree ? 'filled' : 'outlined'} />
          {event.membersOnly ? <BadgeChip label="Members" variant="outlined" /> : null}
        </View>
        <View style={styles.heroBottomRow}>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
            {hasPoster ? 'Event poster' : hasCoords ? 'Map preview' : 'Location preview unavailable'}
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
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  heroMedia: {
    ...StyleSheet.absoluteFillObject,
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
