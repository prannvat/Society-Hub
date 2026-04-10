import React, { useState } from 'react';
import { Pressable, Text, View, Platform, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [membersOnly, setMembersOnly] = useState(false);
  const [formError, setFormError] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (selectedDate: Date) => {
    setDate(selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    hideDatePicker();
  };

  const showTimePicker = () => {
    Keyboard.dismiss();
    setTimePickerVisibility(true);
  };
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleConfirmTime = (selectedTime: Date) => {
    setTime(selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    hideTimePicker();
  };

  const publishEvent = () => {
    if (!title.trim() || !date.trim() || !time.trim() || !location.trim()) {
      setFormError('Please complete all fields before publishing.');
      return;
    }

    const newEventId = addEvent({
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      isFree,
      membersOnly
    });

    setFormError('');
    navigation.replace('EventDetail', { eventId: newEventId });
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Create Event</Text>
      <InputField label="Title" placeholder="Event title" value={title} onChangeText={setTitle} />
      
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

      <InputField label="Location (Address or Venue)" placeholder="e.g. 123 Main St, City" value={location} onChangeText={setLocation} />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', marginRight: 4 }}>Pricing</Text>
        <Pressable onPress={() => setIsFree(true)}>
          <BadgeChip label="Free" variant={isFree ? 'filled' : 'outlined'} />
        </Pressable>
        <Pressable onPress={() => setIsFree(false)}>
          <BadgeChip label="Paid" variant={!isFree ? 'filled' : 'outlined'} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Text style={{ color: theme.colors.textSecondary, fontWeight: '700', marginRight: 4 }}>Access</Text>
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
