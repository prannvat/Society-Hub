const fs = require('fs');
let content = fs.readFileSync('src/screens/ProfileScreen.tsx', 'utf8');

const oldImports = `import React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';`;
const newImports = `import React from 'react';
import { Alert, Pressable, Text, TextInput, View, Linking, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';`;
content = content.replace(oldImports, newImports);

const avatarOld = `          <View style={{ alignItems: 'center', gap: 10 }}>
            <Avatar name={profileName} size={76} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800' }}>{profileName}</Text>
            <BadgeChip label={activeSocietyRole} variant="filled" />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{university} • {year}</Text>
          </View>`;
const avatarNew = `          <View style={{ alignItems: 'center', gap: 10 }}>
            <Avatar name={profileName} size={76} url={avatarUrl} />
            <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{profileName}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <BadgeChip label={activeSocietyRole} variant="filled" />
              {linkedinLink ? (
                <Pressable onPress={() => Linking.openURL(linkedinLink)} style={{ padding: 4, backgroundColor: theme.colors.primary, borderRadius: 12 }}>
                  <FontAwesome name="linkedin" size={14} color="#FFF" />
                </Pressable>
              ) : null}
              {instagramLink ? (
                <Pressable onPress={() => Linking.openURL(instagramLink)} style={{ padding: 4, backgroundColor: theme.colors.primary, borderRadius: 12 }}>
                  <FontAwesome name="instagram" size={14} color="#FFF" />
                </Pressable>
              ) : null}
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>{university} • {year}</Text>
            {profile.bio ? <Text style={{ color: theme.colors.textPrimary, textAlign: 'center', marginHorizontal: 20 }}>{profile.bio}</Text> : null}
          </View>`;
content = content.replace(avatarOld, avatarNew);

const editOld = `        {isEditing ? (
          <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 14, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Edit Profile</Text>

            <TextInput`;
const editNew = `        {isEditing ? (
          <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, padding: 18, gap: 14, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 }}>Edit Profile</Text>

            <OutlineButton 
              label="Change Avatar"
              onPress={async () => {
                const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!perm.granted) return Alert.alert('Permission Denied', 'We need camera roll access.');
                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
                if (!result.canceled && result.assets[0].base64) setAvatarUrl(\`data:image/jpeg;base64,\${result.assets[0].base64}\`);
              }}
            />

            <TextInput`;
content = content.replace(editOld, editNew);

const editInputsOld = `              value={year}
              onChangeText={setYear}
              placeholder="Year"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />`;
const editInputsNew = `              value={year}
              onChangeText={setYear}
              placeholder="Year"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              multiline
              numberOfLines={3}
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary, height: 80, textAlignVertical: 'top' }}
            />
            <TextInput
              value={instagramLink}
              onChangeText={setInstagramLink}
              placeholder="Instagram Link"
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />
            <TextInput
              value={linkedinLink}
              onChangeText={setLinkedinLink}
              placeholder="LinkedIn Link"
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor={theme.colors.textSecondary}
              style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
            />`;
content = content.replace(editInputsOld, editInputsNew);

fs.writeFileSync('src/screens/ProfileScreen.tsx', content);
