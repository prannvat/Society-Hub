import React from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export const EventDetailScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const { rsvpedEventIds, toggleRSVP, events } = useLocalAppState();
  const [saved, setSaved] = React.useState(false);
  const event = events.find((entry) => entry.id === route.params?.eventId) ?? events[0];
  const isRsvped = rsvpedEventIds.includes(event.id);
  const hasPoster = typeof event.posterImageUrl === 'string' && /^https?:\/\//i.test(event.posterImageUrl);
  const hasCoords = typeof event.locationLatitude === 'number' && typeof event.locationLongitude === 'number';

  const handleRSVP = async () => {
    try {
      await toggleRSVP(event.id);
      if (!isRsvped) {
        Alert.alert('RSVP Confirmed', `You're now attending ${event.title}!`);
      } else {
        Alert.alert('RSVP Cancelled', `You're no longer attending ${event.title}.`);
      }
    } catch {
      Alert.alert('RSVP Failed', 'Unable to update RSVP right now. Please try again.');
    }
  };

  const fallbackLat = 53.4722;
  const fallbackLng = -2.2382;
  const mapLat = hasCoords ? event.locationLatitude! : fallbackLat;
  const mapLng = hasCoords ? event.locationLongitude! : fallbackLng;

  const openMap = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${mapLat},${mapLng}`;
    const label = encodeURIComponent(event.location);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface }]}> 
          {hasPoster ? <Image source={{ uri: event.posterImageUrl }} style={styles.heroMedia} resizeMode="cover" /> : null}
          {!hasPoster && hasCoords ? (
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.heroMedia}
              initialRegion={{
                latitude: mapLat,
                longitude: mapLng,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: mapLat, longitude: mapLng }} />
            </MapView>
          ) : null}
          <View style={styles.heroTopRow}>
            <Pressable onPress={() => navigation.goBack()}>
              <BadgeChip label="Back" variant="outlined" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable>
                <BadgeChip label="Share" variant="outlined" />
              </Pressable>
              <Pressable onPress={() => setSaved((prev) => !prev)}>
                <BadgeChip label={saved ? 'Saved' : 'Save'} variant="outlined" />
              </Pressable>
            </View>
          </View>
          <Text style={[styles.heroText, { color: theme.colors.textSecondary }]}>
            {hasPoster ? 'Poster' : hasCoords ? 'Location map preview' : 'No poster or location map available'}
          </Text>
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]}>{event.title}</Text>

        <View style={styles.tagRow}>
          <BadgeChip label={event.isFree ? 'Free Event' : 'Paid Event'} />
          <BadgeChip label={event.membersOnly ? 'Members Only' : 'Open to All'} variant="outlined" />
        </View>

        <View style={styles.hostRow}>
          <View style={styles.hostInfo}>
            <Avatar name="Manchester Sikh Society" size={36} />
            <Text style={[styles.hostText, { color: theme.colors.textSecondary }]}>Hosted by Manchester Sikh Society</Text>
          </View>
          <BadgeChip label="Follow" variant="outlined" />
        </View>

        <View style={styles.tagRow}>
          <BadgeChip label={event.date} />
          <BadgeChip label={event.time} variant="outlined" />
          <BadgeChip label={event.location} variant="outlined" />
        </View>

        <View style={[styles.accessCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          <Text style={[styles.accessTitle, { color: theme.colors.textPrimary }]}>Access</Text>
          <Text style={[styles.accessText, { color: theme.colors.textSecondary }]}>
            {event.membersOnly
              ? 'This event is reserved for society members. RSVP confirms your member attendance slot.'
              : 'This event is open to everyone. Invite friends and RSVP to help the committee plan capacity.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>About this event</Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary }]}>
            {event.description?.trim() || 'Details for this event will be announced soon.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Attendees</Text>
          <View style={styles.attendeesRow}>
            <Avatar name="Amrit Kaur" size={30} />
            <Avatar name="Harleen Kaur" size={30} />
            <Avatar name="Gurpreet Singh" size={30} />
            <Text style={[styles.attendeeCount, { color: theme.colors.textSecondary }]}>{event.attendingCount} going</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Gallery</Text>
          <View style={styles.galleryRow}>
            <View style={[styles.galleryTile, { backgroundColor: theme.colors.surface }]} />
            <View style={[styles.galleryTile, { backgroundColor: theme.colors.surface }]} />
            <View style={[styles.galleryTile, { backgroundColor: theme.colors.surface }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Location</Text>
          <Text style={[styles.sectionText, { color: theme.colors.textSecondary, marginBottom: 14 }]}>{event.location}</Text>
          <Pressable onPress={openMap} style={[styles.mapCard, { backgroundColor: theme.colors.surface }]}> 
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={{
                latitude: mapLat,
                longitude: mapLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: mapLat, longitude: mapLng }} />
            </MapView>
            <View style={[styles.mapButton, { backgroundColor: theme.colors.primary }]}> 
              <Text style={[styles.mapButtonText, { color: theme.colors.background }]}>Open in Maps</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}> 
        <Text style={[styles.priceTag, { color: theme.colors.textPrimary }]}>{event.isFree ? 'Free' : 'Paid'}</Text>
        <View style={styles.footerButton}>
          <PrimaryButton label={isRsvped ? 'Attending' : 'RSVP Now'} onPress={handleRSVP} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 22
  },
  heroCard: {
    height: 268,
    borderRadius: 24,
    justifyContent: 'space-between',
    padding: 24,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  heroMedia: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10
  },
  heroText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36
  },
  hostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  hostText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  section: {
    gap: 12
  },
  accessCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6
  },
  accessTitle: {
    fontSize: 14,
    fontWeight: '800'
  },
  accessText: {
    fontSize: 13,
    lineHeight: 19
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  attendeeCount: {
    fontSize: 13,
    fontWeight: '600'
  },
  galleryRow: {
    flexDirection: 'row',
    gap: 10
  },
  galleryTile: {
    flex: 1,
    height: 78,
    borderRadius: 16
  },
  mapCard: {
    height: 168,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  map: {
    flex: 1
  },
  mapButton: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: '700'
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '800'
  },
  footerButton: {
    flex: 1
  }
});
