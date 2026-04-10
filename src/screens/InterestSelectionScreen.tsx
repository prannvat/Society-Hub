import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BadgeChip } from '@/components/BadgeChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const InterestSelectionScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedInterests, setSelectedInterests } = useLocalAppState();
  const options = ['Events', 'Volunteering', 'Sports', 'Faith Talks', 'Networking', 'Mentorship'];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
      return;
    }

    setSelectedInterests([...selectedInterests, interest]);
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Select Interests</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Pick what you care about. You can update this later in settings.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => (
          <Pressable key={opt} onPress={() => toggleInterest(opt)}>
            <BadgeChip label={opt} variant={selectedInterests.includes(opt) ? 'filled' : 'outlined'} />
          </Pressable>
        ))}
      </View>
      <Text style={{ color: theme.colors.textSecondary }}>Selected: {selectedInterests.length}</Text>
      <PrimaryButton label="Save Interests" onPress={() => navigation.replace('MainTabs')} />
      </View>
    </ScreenLayout>
  );
};
