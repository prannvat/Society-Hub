import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { BadgeChip } from '@/components/BadgeChip';
import { OutlineButton } from '@/components/OutlineButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const CreateEventScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addEvent } = useLocalAppState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedDateValue, setSelectedDateValue] = useState<Date | null>(null);
  const [selectedTimeValue, setSelectedTimeValue] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [locationPlaceId, setLocationPlaceId] = useState<string | undefined>();
  const [locationLatitude, setLocationLatitude] = useState<number | undefined>();
  const [locationLongitude, setLocationLongitude] = useState<number | undefined>();
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ placeId: string; name: string; lat: number; lon: number }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [posterImageUrl, setPosterImageUrl] = useState<string | undefined>();
  const [posterImageLocalUri, setPosterImageLocalUri] = useState<string | undefined>();
  const [posterPreviewFailed, setPosterPreviewFailed] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [membersOnly, setMembersOnly] = useState(false);
  const [formError, setFormError] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const hasPosterImage = Boolean(posterImageLocalUri || posterImageUrl);
  const hasSelectedLocation = typeof locationLatitude === 'number' && typeof locationLongitude === 'number';

  const pickPosterFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to select an event poster.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    const encoded = asset.base64;

    if (!encoded) {
      Alert.alert('Image conversion failed', 'Please try another image.');
      return;
    }

    const dataUri = `data:${mimeType};base64,${encoded}`;
    setPosterImageLocalUri(asset.uri);
    setPosterImageUrl(dataUri);
    setPosterPreviewFailed(false);
  };

  useEffect(() => {
    let cancelled = false;
    const query = location.trim();

    if (query.length < 3) {
      setLocationSuggestions([]);
      return () => {
        cancelled = true;
      };
    }

    const timeout = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(query)}`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        );
        const payload = (await response.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
        }>;
        if (cancelled) return;
        const mapped = payload
          .map((entry) => ({
            placeId: String(entry.place_id),
            name: entry.display_name,
            lat: Number(entry.lat),
            lon: Number(entry.lon),
          }))
          .filter((entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lon));
        setLocationSuggestions(mapped);
      } catch {
        if (!cancelled) {
          setLocationSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [location]);

  const locationHint = useMemo(() => {
    if (hasSelectedLocation) return 'Location verified';
    if (isLoadingSuggestions) return 'Searching places...';
    if (location.trim().length >= 3 && locationSuggestions.length === 0) return 'No exact matches yet';
    return 'Search and select a real location';
  }, [hasSelectedLocation, isLoadingSuggestions, location, locationSuggestions.length]);

  const normalizeErrorMessage = (error: unknown) => {
    if (!(error instanceof Error)) {
      return 'Unable to publish event right now. Please try again.';
    }

    const raw = error.message?.trim();
    if (!raw) {
      return 'Unable to publish event right now. Please try again.';
    }

    try {
      const parsed = JSON.parse(raw) as { message?: string | string[] };
      const message = Array.isArray(parsed.message) ? parsed.message[0] : parsed.message;
      if (typeof message === 'string' && message.length > 0) {
        if (message.toLowerCase().includes('access')) {
          return 'Only Committee or President members can publish events in this society.';
        }
        return message;
      }
    } catch {
      if (raw.toLowerCase().includes('access')) {
        return 'Only Committee or President members can publish events in this society.';
      }
      return raw;
    }

    return 'Unable to publish event right now. Please try again.';
  };

  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (selectedDate: Date) => {
    setSelectedDateValue(selectedDate);
    setDate(selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    hideDatePicker();
  };

  const showTimePicker = () => {
    Keyboard.dismiss();
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleConfirmTime = (selectedTime: Date) => {
    setSelectedTimeValue(selectedTime);
    setTime(selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    hideTimePicker();
  };

  const publishEvent = async () => {
    if (!title.trim() || !description.trim() || !date.trim() || !time.trim() || !location.trim() || !selectedDateValue || !selectedTimeValue) {
      setFormError('Please complete all fields before publishing.');
      return;
    }

    if (!hasSelectedLocation && !locationPlaceId) {
      setFormError('Select a location from search results so attendees can navigate accurately.');
      return;
    }

    const composedStartAt = new Date(selectedDateValue);
    composedStartAt.setHours(selectedTimeValue.getHours(), selectedTimeValue.getMinutes(), 0, 0);

    if (Number.isNaN(composedStartAt.getTime())) {
      setFormError('Please choose a valid date and time.');
      return;
    }

    try {
      const newEventId = await addEvent({
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        locationPlaceId,
        locationLatitude,
        locationLongitude,
        posterImageUrl,
        startAtIso: composedStartAt.toISOString(),
        isFree,
        membersOnly
      });

      setFormError('');
      navigation.replace('EventDetail', { eventId: newEventId });
    } catch (error) {
      setFormError(normalizeErrorMessage(error));
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.formWrap}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create Event</Text>
        <InputField label="Title" placeholder="Event title" value={title} onChangeText={setTitle} />
        <InputField
          label="Description"
          placeholder="What's happening at this event?"
          value={description}
          onChangeText={setDescription}
        />

        <Pressable onPress={showDatePicker}>
          <View pointerEvents="none">
            <InputField label="Date" placeholder="Select Date" value={date} onChangeText={() => {}} />
          </View>
        </Pressable>

        <Pressable onPress={showTimePicker}>
          <View pointerEvents="none">
            <InputField label="Time" placeholder="Select Time" value={time} onChangeText={() => {}} />
          </View>
        </Pressable>

        <InputField
          label="Location"
          placeholder="Search venue, street, or landmark"
          value={location}
          onChangeText={(value) => {
            setLocation(value);
            setLocationPlaceId(undefined);
            setLocationLatitude(undefined);
            setLocationLongitude(undefined);
          }}
        />
        <Text style={[styles.helperText, { color: hasSelectedLocation ? theme.colors.success : theme.colors.textSecondary }]}>
          {locationHint}
        </Text>

        {locationSuggestions.length > 0 ? (
          <View style={[styles.suggestionWrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
            {locationSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion.placeId}
                onPress={() => {
                  setLocation(suggestion.name);
                  setLocationPlaceId(suggestion.placeId);
                  setLocationLatitude(suggestion.lat);
                  setLocationLongitude(suggestion.lon);
                  setLocationSuggestions([]);
                }}
                style={styles.suggestionRow}
              >
                <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                  {suggestion.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.posterActions}>
          <Text style={[styles.posterLabel, { color: theme.colors.textSecondary }]}>Poster (optional)</Text>
          <PrimaryButton label={posterImageLocalUri ? 'Change Poster' : 'Choose from Camera Roll'} onPress={pickPosterFromLibrary} />
          {posterImageLocalUri ? (
            <Pressable
              onPress={() => {
                setPosterImageLocalUri(undefined);
                setPosterImageUrl(undefined);
                setPosterPreviewFailed(false);
              }}
            >
              <Text style={[styles.removePosterText, { color: theme.colors.error }]}>Remove poster</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.previewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {hasPosterImage && !posterPreviewFailed ? (
            <Image
              source={{ uri: posterImageLocalUri ?? posterImageUrl }}
              style={styles.previewMedia}
              resizeMode="cover"
              onError={() => setPosterPreviewFailed(true)}
            />
          ) : hasSelectedLocation ? (
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.previewMedia}
              initialRegion={{
                latitude: locationLatitude!,
                longitude: locationLongitude!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: locationLatitude!, longitude: locationLongitude! }} />
            </MapView>
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={[styles.emptyPreviewText, { color: theme.colors.textSecondary }]}>Poster preview will appear here</Text>
              <Text style={[styles.emptyPreviewText, { color: theme.colors.textSecondary }]}>If no poster is set, attendees will see a map.</Text>
            </View>
          )}
        </View>

        <View style={styles.segmentRow}>
          <Text style={[styles.segmentTitle, { color: theme.colors.textSecondary }]}>Pricing</Text>
          <Pressable onPress={() => setIsFree(true)}>
            <BadgeChip label="Free" variant={isFree ? 'filled' : 'outlined'} />
          </Pressable>
          <Pressable onPress={() => setIsFree(false)}>
            <BadgeChip label="Paid" variant={!isFree ? 'filled' : 'outlined'} />
          </Pressable>
        </View>

        <View style={styles.segmentRow}>
          <Text style={[styles.segmentTitle, { color: theme.colors.textSecondary }]}>Access</Text>
          <Pressable onPress={() => setMembersOnly(false)}>
            <BadgeChip label="Open" variant={!membersOnly ? 'filled' : 'outlined'} />
          </Pressable>
          <Pressable onPress={() => setMembersOnly(true)}>
            <BadgeChip label="Members Only" variant={membersOnly ? 'filled' : 'outlined'} />
          </Pressable>
        </View>

        {formError ? <Text style={{ color: theme.colors.error }}>{formError}</Text> : null}

        <PrimaryButton label="Publish Event" onPress={publishEvent} />
        <OutlineButton label="Cancel" onPress={() => navigation.goBack()} />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
        />

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  formWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 12,
    marginTop: -10,
  },
  suggestionWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d4d4d8',
  },
  suggestionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  posterActions: {
    gap: 10,
  },
  posterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  removePosterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 170,
    overflow: 'hidden',
  },
  previewMedia: {
    width: '100%',
    height: 190,
  },
  emptyPreview: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyPreviewText: {
    fontSize: 13,
    textAlign: 'center',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  segmentTitle: {
    fontWeight: '700',
    marginRight: 4,
  },
});
