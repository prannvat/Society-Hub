const fs = require('fs');

const path = 'src/screens/ProfileSetupScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
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
  
  const [location, setLocation] = useState(profile.location || '');
  const [isStudent, setIsStudent] = useState(profile.isStudent ?? true);
  const [university, setUniversity] = useState(profile.university || '');
  const [course, setCourse] = useState(profile.course || '');
  const [year, setYear] = useState(profile.year || '');
  const [bio, setBio] = useState(profile.bio || '');

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Profile Setup</Text>
          <Text style={{ color: theme.colors.textSecondary, lineHeight: 22 }}>
            Complete your basics so you can discover relevant societies and events.
          </Text>
        </View>

        <InputField 
          label="Where are you based?" 
          placeholder="e.g. London" 
          value={location} 
          onChangeText={setLocation} 
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '600' }}>Are you a university student?</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 }}>Unlock campus-specific groups and admin tools.</Text>
          </View>
          <Switch 
            value={isStudent} 
            onValueChange={setIsStudent}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>

        {isStudent && (
          <View style={{ gap: 16, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: theme.colors.border }}>
            <InputField label="University" placeholder="e.g. King's College London" value={university} onChangeText={setUniversity} />
            <InputField label="Course" placeholder="e.g. Computer Science" value={course} onChangeText={setCourse} />
            <InputField label="Year" placeholder="e.g. 2nd Year" value={year} onChangeText={setYear} />
          </View>
        )}

        <InputField 
          label="Bio (Optional)" 
          placeholder="Tell us a little about yourself" 
          value={bio} 
          onChangeText={setBio} 
        />

        <View style={{ marginTop: 20 }}>
          <PrimaryButton
            label="Continue"
            onPress={async () => {
              try {
                await updateProfile({
                  ...profile,
                  location: location.trim() || profile.location,
                  isStudent,
                  university: isStudent ? (university.trim() || profile.university) : '',
                  course: isStudent ? (course.trim() || profile.course) : '',
                  year: isStudent ? (year.trim() || profile.year) : '',
                  bio: bio.trim() || profile.bio
                });
                navigation.navigate('InterestSelection');
              } catch (e) {
                console.error('Failed to update profile', e);
              }
            }}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0' // Using static for now, theme takes precedence if available
  }
});`;

content = content.replace(/import React from 'react';\nimport { Alert } from 'react-native';[\s\S]*?export const ProfileSetupScreen = \(\) => {[\s\S]*?navigation\.navigate\('InterestSelection'\);\n            \}[\s\S]*?<\/View>\n    <\/ScreenLayout>\n  \);\n};\n/m, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Profile Setup Screen replaced successfully!');
