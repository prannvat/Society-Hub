import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { InputField } from '@/components/InputField';
import { Card } from '@/components/Card';
import { ProfileLinksEditor } from '@/components/ProfileLinksEditor';
import { UsernameField, UsernameStatus } from '@/components/UsernameField';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { updateMe } from '@/services/api/me';
import { uploadImage } from '@/services/api/uploads';
import { UserLinkInput, profileErrorMessage, updateMyLinks } from '@/services/api/users';

const MAX_BIO_LENGTH = 300;

export const EditProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const toast = useToast();
  const { profile, updateProfile } = useLocalAppState();
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [course, setCourse] = useState(profile.course || '');
  const [year, setYear] = useState(profile.year || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Handle + links come from the API user, the source of truth for both.
  const [username, setUsername] = useState(user?.username ?? '');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('empty');
  const [links, setLinks] = useState<UserLinkInput[]>(
    (user?.links ?? []).map((link) => ({
      platform: link.platform,
      label: link.label,
      url: link.url,
    })),
  );

  const originalUsername = (user?.username ?? '').toLowerCase();
  const normalisedUsername = username.trim().toLowerCase();
  // Clearing a handle isn't supported by the backend (PATCH /me with null 500s),
  // so an emptied field is treated as "leave my handle alone" rather than a change.
  const usernameChanged = normalisedUsername.length > 0 && normalisedUsername !== originalUsername;
  // Only block on a handle the user actually touched — a stale 'taken' reading
  // for their own existing handle must never lock them out of saving.
  const usernameBlocked =
    usernameChanged && (usernameStatus === 'invalid' || usernameStatus === 'taken' || usernameStatus === 'checking');

  const handleUsernameStatus = useCallback((status: UsernameStatus) => {
    setUsernameStatus(status);
  }, []);

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
    });
    if (result.canceled) {
      return;
    }
    // Upload immediately rather than holding bytes in state: the profile
    // stores a URL, so the image must exist in storage before Save runs.
    setIsUploadingAvatar(true);
    try {
      setAvatarUrl(await uploadImage(result.assets[0].uri, 'AVATAR'));
    } catch {
      toast.show('Could not upload that image. Please try again.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }
    if (usernameBlocked) {
      toast.show(
        usernameStatus === 'checking'
          ? 'Still checking that username — one moment.'
          : 'Pick an available username before saving.',
        'error',
      );
      return;
    }

    setIsSaving(true);
    try {
      // The handle lives on PATCH /me but not in LocalProfile, so it goes in its
      // own call before the shared profile update.
      if (usernameChanged) {
        await updateMe({ username: normalisedUsername });
      }

      await updateProfile({
        ...profile,
        fullName,
        bio,
        university,
        course,
        year,
        avatarUrl,
      });

      // Links are replaced as a whole set, ordered by list position.
      await updateMyLinks(links);

      // Pull the authoritative user back so username/links render immediately.
      await refreshUser();

      toast.show('Profile updated', 'success');
      navigation.goBack();
    } catch (error) {
      toast.show(profileErrorMessage(error), 'error');
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
                {isUploadingAvatar ? 'Uploading photo…' : 'Change profile photo'}
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
            <UsernameField
              value={username}
              onChangeText={setUsername}
              onStatusChange={handleUsernameStatus}
            />
            <View>
              <InputField
                label="Bio"
                placeholder="A little bit about yourself..."
                value={bio}
                onChangeText={(next) => setBio(next.slice(0, MAX_BIO_LENGTH))}
                multiline
              />
              <Text
                style={[
                  theme.typography.caption,
                  {
                    color: bio.length >= MAX_BIO_LENGTH ? theme.colors.danger : theme.colors.textTertiary,
                    alignSelf: 'flex-end',
                    marginTop: 4
                  }
                ]}
              >
                {bio.length}/{MAX_BIO_LENGTH}
              </Text>
            </View>
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

        {/* Links — the flexible "add your socials" surface */}
        <Card>
          <Text style={[theme.typography.h3, styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Your links
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 14 }]}>
            Show people where to find you. These appear as tappable chips on your profile.
          </Text>
          <ProfileLinksEditor links={links} onChange={setLinks} />
        </Card>

        <PrimaryButton
          label="Save Changes"
          onPress={handleSave}
          loading={isSaving}
          disabled={usernameBlocked || isUploadingAvatar}
          icon="check"
        />
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
