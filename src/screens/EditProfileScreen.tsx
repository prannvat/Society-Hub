import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { InputField } from '@/components/InputField';
import { Card } from '@/components/Card';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const EditProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const toast = useToast();
  const { profile, updateProfile } = useLocalAppState();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [course, setCourse] = useState(profile.course || '');
  const [year, setYear] = useState(profile.year || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  // Social Links
  const [instagramLink, setInstagramLink] = useState(profile.instagramLink || '');
  const [linkedinLink, setLinkedinLink] = useState(profile.linkedinLink || '');
  const [githubLink, setGithubLink] = useState(profile.githubLink || '');
  const [twitterLink, setTwitterLink] = useState(profile.twitterLink || '');
  const [websiteLink, setWebsiteLink] = useState(profile.websiteLink || '');

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'We need camera roll access to pick an avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const dataUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarUrl(dataUri);
    }
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        ...profile,
        fullName,
        bio,
        university,
        course,
        year,
        avatarUrl,
        instagramLink,
        linkedinLink,
        githubLink,
        twitterLink,
        websiteLink
      });
      toast.show('Profile updated', 'success');
      navigation.goBack();
    } catch {
      toast.show('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="Edit Profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.imagePickerWrap}>
          <Pressable
            onPress={pickAvatar}
            style={({ pressed }) => [
              styles.avatarPreview,
              { borderColor: theme.colors.border, opacity: pressed ? 0.8 : 1 }
            ]}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: theme.colors.surfaceSunken }]}>
                <MaterialIcons name="add-a-photo" size={28} color={theme.colors.textSecondary} />
              </View>
            )}
          </Pressable>
          <Pressable onPress={pickAvatar} hitSlop={8}>
            {({ pressed }) => (
              <Text style={[theme.typography.captionMedium, { color: theme.colors.primary, marginTop: 12, opacity: pressed ? 0.6 : 1 }]}>
                Change profile photo
              </Text>
            )}
          </Pressable>
        </View>

        {/* Public Information */}
        <Card>
          <Text style={[theme.typography.h3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Public information
          </Text>
          <View style={styles.fieldGroup}>
            <InputField
              label="Name"
              placeholder="Your name"
              value={fullName}
              onChangeText={setFullName}
              icon="badge"
            />
            <InputField
              label="Bio"
              placeholder="A little bit about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
            />
          </View>
        </Card>

        {/* Academics */}
        <Card>
          <Text style={[theme.typography.h3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Academics
          </Text>
          <View style={styles.fieldGroup}>
            <InputField
              label="University"
              placeholder="University name"
              value={university}
              onChangeText={setUniversity}
              icon="school"
            />
            <InputField
              label="Course"
              placeholder="e.g. Computer Science"
              value={course}
              onChangeText={setCourse}
              icon="menu-book"
            />
            <InputField
              label="Year"
              placeholder="e.g. Year 2"
              value={year}
              onChangeText={setYear}
              icon="calendar-today"
            />
          </View>
        </Card>

        {/* Links */}
        <Card>
          <Text style={[theme.typography.h3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Links
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 14 }]}>
            Add your social and professional links to your profile.
          </Text>
          <View style={styles.fieldGroup}>
            <InputField
              label="Instagram"
              placeholder="Instagram profile URL"
              value={instagramLink}
              onChangeText={setInstagramLink}
              icon="link"
              autoCapitalize="none"
            />
            <InputField
              label="LinkedIn"
              placeholder="LinkedIn profile URL"
              value={linkedinLink}
              onChangeText={setLinkedinLink}
              icon="link"
              autoCapitalize="none"
            />
            <InputField
              label="GitHub"
              placeholder="GitHub profile URL"
              value={githubLink}
              onChangeText={setGithubLink}
              icon="link"
              autoCapitalize="none"
            />
            <InputField
              label="X (Twitter)"
              placeholder="X (Twitter) profile URL"
              value={twitterLink}
              onChangeText={setTwitterLink}
              icon="link"
              autoCapitalize="none"
            />
            <InputField
              label="Website"
              placeholder="Website / portfolio URL"
              value={websiteLink}
              onChangeText={setWebsiteLink}
              icon="language"
              autoCapitalize="none"
            />
          </View>
        </Card>

        <PrimaryButton label="Save Changes" onPress={handleSave} loading={isSaving} icon="check" />
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16
  },
  imagePickerWrap: {
    alignItems: 'center',
    marginVertical: 8
  },
  avatarPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  sectionTitle: {
    marginBottom: 14
  },
  fieldGroup: {
    gap: 14
  }
});
