import React from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Avatar } from '@/components/Avatar';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { useToast } from '@/components/Toast';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export const EventDetailScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'EventDetail'>>();
  const toast = useToast();
  const { rsvpedEventIds, toggleRSVP, events, exploreEvents, allSocieties } = useLocalAppState();
  const [saved, setSaved] = React.useState(false);
  const event =
    events.find((entry) => entry.id === route.params?.eventId) ??
    exploreEvents.find((entry) => entry.id === route.params?.eventId);

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notFoundWrap}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Event not found</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
            This event may have been removed or has not loaded yet.
          </Text>
          <PrimaryButton label="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const hostSociety = allSocieties.find((society) => society.id === event.societyId);
  const hostName = hostSociety?.name ?? event.societyName ?? 'Society';
  const brand = hostSociety?.primaryColor || theme.colors.primary;
  const isRsvped = rsvpedEventIds.includes(event.id);
  const hasPoster = typeof event.posterImageUrl === 'string' && /^https?:\/\//i.test(event.posterImageUrl);
  const hasCoords = typeof event.locationLatitude === 'number' && typeof event.locationLongitude === 'number';

  const eventDate = event.startAtIso ? new Date(event.startAtIso) : new Date(event.date);
  const hasParsedDate = !Number.isNaN(eventDate.getTime());

  const handleRSVP = async () => {
    try {
      await toggleRSVP(event.id);
      if (!isRsvped) {
        toast.show(`You're attending ${event.title}!`, 'success');
      } else {
        toast.show('RSVP cancelled', 'info');
      }
    } catch {
      toast.show('Unable to update RSVP right now. Please try again.', 'error');
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

  const iconButtonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.iconButton,
    theme.elevation.e1,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      opacity: pressed ? 0.7 : 1
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top actions */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={6} style={iconButtonStyle}>
            <MaterialIcons name="arrow-back" size={22} color={theme.colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => setSaved((prev) => !prev)} hitSlop={6} style={iconButtonStyle}>
            <MaterialIcons
              name={saved ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={saved ? theme.colors.primary : theme.colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* Brand-tinted hero */}
        <View style={[styles.heroCard, { backgroundColor: `${brand}1A`, borderColor: theme.colors.border }]}>
          {hasPoster ? (
            <Image source={{ uri: event.posterImageUrl }} style={styles.heroMedia} resizeMode="cover" />
          ) : null}
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

          <View style={styles.heroBody}>
            <View style={[styles.dateBlock, theme.elevation.e1, { backgroundColor: theme.colors.surface }]}>
              {hasParsedDate ? (
                <>
                  <Text style={[theme.typography.h2, { color: brand }]}>{eventDate.getDate()}</Text>
                  <Text style={[theme.typography.micro, { color: brand }]}>
                    {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </>
              ) : (
                <MaterialIcons name="event" size={24} color={brand} />
              )}
            </View>
            <View style={styles.heroTitleWrap}>
              <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>{event.title}</Text>
              <View style={styles.tagRow}>
                <BadgeChip label={event.isFree ? 'Free Event' : 'Paid Event'} variant={event.isFree ? 'success' : 'neutral'} />
                <BadgeChip label={event.membersOnly ? 'Members Only' : 'Open to All'} variant={event.membersOnly ? 'primary' : 'neutral'} />
              </View>
            </View>
          </View>
        </View>

        {/* Host */}
        <Card padding={12}>
          <View style={styles.hostRow}>
            <Avatar name={hostName} size={40} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>Hosted by</Text>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {hostName}
              </Text>
            </View>
            {hostSociety ? (
              <Pressable
                onPress={() => navigation.navigate('SocietyProfile', { societyId: hostSociety.id })}
                hitSlop={8}
              >
                {({ pressed }) => (
                  <MaterialIcons name="chevron-right" size={24} color={theme.colors.textTertiary} style={{ opacity: pressed ? 0.5 : 1 }} />
                )}
              </Pressable>
            ) : null}
          </View>
        </Card>

        {/* Key info */}
        <Card padding={0}>
          <ListRow
            title={event.date}
            subtitle={event.time}
            leading={<MaterialIcons name="schedule" size={22} color={theme.colors.primary} />}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title={event.location}
            subtitle="Tap the map below for directions"
            leading={<MaterialIcons name="place" size={22} color={theme.colors.primary} />}
          />
          <View style={[styles.rowDivider, { backgroundColor: theme.colors.border }]} />
          <ListRow
            title={`${event.attendingCount} going`}
            subtitle={event.membersOnly ? 'Reserved for society members' : 'Open to everyone — invite friends'}
            leading={<MaterialIcons name="people-outline" size={22} color={theme.colors.primary} />}
          />
        </Card>

        {/* About */}
        <View style={styles.section}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>About this event</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
            {event.description?.trim() || 'Details for this event will be announced soon.'}
          </Text>
        </View>

        {/* Location map */}
        <View style={styles.section}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Location</Text>
          <Pressable
            onPress={openMap}
            style={({ pressed }) => [
              styles.mapCard,
              theme.elevation.e1,
              { backgroundColor: theme.colors.surface, opacity: pressed ? 0.9 : 1 }
            ]}
          >
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
            <View style={[styles.mapButton, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill }]}>
              <MaterialIcons name="directions" size={14} color={theme.colors.textOnPrimary} />
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textOnPrimary, fontSize: 12 }]}>
                Open in Maps
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sticky RSVP footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <View style={styles.footerMeta}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>
            {event.isFree ? 'Free' : 'Paid'}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {event.attendingCount} going
          </Text>
        </View>
        <View style={styles.footerButton}>
          <PrimaryButton
            label={isRsvped ? 'Cancel RSVP' : 'RSVP Now'}
            variant={isRsvped ? 'secondary' : 'primary'}
            icon={isRsvped ? undefined : 'event-available'}
            onPress={handleRSVP}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12
  },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 18
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden'
  },
  heroMedia: {
    width: '100%',
    height: 180
  },
  heroBody: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    alignItems: 'flex-start'
  },
  dateBlock: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  heroTitleWrap: {
    flex: 1,
    gap: 10
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50
  },
  section: {
    gap: 10
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  footerMeta: {
    gap: 2
  },
  footerButton: {
    flex: 1
  }
});
