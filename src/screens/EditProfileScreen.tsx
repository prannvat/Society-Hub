import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const EditProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { profile, updateProfile } = useLocalAppState();
  
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [course, setCourse] = useState(profile.course || '');
  const [year, setYear] = useState(profile.year || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');

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
      const dataUri = `data:image/jpeg;base64,\${result.assets[0].base64}`;
      setAvatarUrl(dataUri);
    }
  };

  const handleSave = async () => {
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
      navigation.goBack();
    } catch {
      Alert.alert('Failed', 'Failed to update profile.');
    }
  };

  return (
    <ScreenLayout>
      <TopNavBar title="Edit Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar Section */}
        <View style={styles.imagePickerWrap}>
           <TouchableOpacity onPress={pickAvatar} style={[styles.avatarPreview, { borderColor: theme.colors.border }]}>
             {avatarUrl ? (
               <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
             ) : (
               <View style={[styles.placeholderAvatar, { backgroundColor: theme.colors.surface }]}>
                 <MaterialIcons name="add-a-photo" size={28} color={theme.colors.textSecondary} />
                 <Text style={{ color: theme.colors.textSecondary, marginTop: 6, fontSize: 12 }}>Edit Picture</Text>
               </View>
             )}
           </TouchableOpacity>
           <Text style={{ color: theme.colors.primary, marginTop: 12, fontWeight: '600' }} onPress={pickAvatar}>
              Change profile photo
           </Text>
        </View>

        {/* Public Information */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Public Information</Text>
          
          <View style={[styles.inputGroup, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your Name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.inputGroup, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.multiLine, { color: theme.colors.textPrimary }]}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
              placeholder="A little bit about yourself..."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Academics */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Academics</Text>
          
          <View style={[styles.inputGroup, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>University</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={university}
              onChangeText={setUniversity}
              placeholder="University Name"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.inputGroup, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Course</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={course}
              onChangeText={setCourse}
              placeholder="e.g. Computer Science"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>Year</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={year}
              onChangeText={setYear}
              placeholder="e.g. Year 2"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Links (Instagram-like) */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Links</Text>
          <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 12 }}>Add your social and professional links to your profile.</Text>

          <View style={styles.linkRow}>
            <FontAwesome name="instagram" size={24} color="#E1306C" style={styles.iconWidth} />
            <TextInput
              style={[styles.linkInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.border }]}
              value={instagramLink}
              onChangeText={setInstagramLink}
              placeholder="Instagram Profile URL"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.linkRow}>
            <FontAwesome name="linkedin-square" size={24} color="#0077b5" style={styles.iconWidth} />
            <TextInput
              style={[styles.linkInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.border }]}
              value={linkedinLink}
              onChangeText={setLinkedinLink}
              placeholder="LinkedIn Profile URL"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.linkRow}>
            <FontAwesome name="github" size={24} color={theme.colors.textPrimary} style={styles.iconWidth} />
            <TextInput
              style={[styles.linkInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.border }]}
              value={githubLink}
              onChangeText={setGithubLink}
              placeholder="GitHub Profile URL"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.linkRow}>
            <FontAwesome name="twitter" size={24} color="#1DA1F2" style={styles.iconWidth} />
            <TextInput
              style={[styles.linkInput, { color: theme.colors.textPrimary, borderBottomColor: theme.colors.border }]}
              value={twitterLink}
              onChangeText={setTwitterLink}
              placeholder="X (Twitter) Profile URL"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={[styles.linkRow, { borderBottomWidth: 0 }]}>
            <FontAwesome name="globe" size={24} color={theme.colors.textSecondary} style={styles.iconWidth} />
            <TextInput
              style={[styles.linkInput, { color: theme.colors.textPrimary, borderBottomWidth: 0 }]}
              value={websiteLink}
              onChangeText={setWebsiteLink}
              placeholder="Website / Portfolio URL"
              keyboardType="url"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton label="Save Changes" onPress={handleSave} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  imagePickerWrap: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarPreview: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  inputLabel: {
    width: 90,
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  multiLine: {
    height: 60,
    textAlignVertical: 'top',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWidth: {
    width: 32,
    textAlign: 'center',
  },
  linkInput: {
    flex: 1,
    fontSize: 15,
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginLeft: 12,
  },
});
