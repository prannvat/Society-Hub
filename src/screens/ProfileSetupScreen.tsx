import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const ProfileSetupScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, updateProfile } = useLocalAppState();
  const [course, setCourse] = React.useState(profile.course);
  const [year, setYear] = React.useState(profile.year);
  const [bio, setBio] = React.useState(profile.bio);

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Profile Setup</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Complete your basics so members can find you faster.</Text>
      <InputField label="Course" placeholder="Computer Science" value={course} onChangeText={setCourse} />
      <InputField label="Year" placeholder="2nd Year" value={year} onChangeText={setYear} />
      <InputField label="Bio" placeholder="Tell us about yourself" value={bio} onChangeText={setBio} />
      <View style={{ marginTop: 8 }}>
        <PrimaryButton
          label="Continue"
          onPress={() => {
            updateProfile({
              ...profile,
              course: course.trim() || profile.course,
              year: year.trim() || profile.year,
              bio: bio.trim() || profile.bio
            });
            navigation.navigate('InterestSelection');
          }}
        />
      </View>
      </View>
    </ScreenLayout>
  );
};
