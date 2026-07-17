import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const EditSocietyProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const { allSocieties, activeSocietyId, updateSocietyProfile } = useLocalAppState();
  
  const society = allSocieties.find(s => s.id === activeSocietyId);

  const [description, setDescription] = useState(society?.description || '');
  const [logoUrl, setLogoUrl] = useState(society?.logoUrl || '');
  const [instagramLink, setInstagramLink] = useState(society?.instagramLink || '');
  const [whatsappLink, setWhatsappLink] = useState(society?.whatsappLink || '');

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'We need camera roll access to pick a logo.');
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
      setLogoUrl(dataUri);
    }
  };

  const handleSave = async () => {
    if (!society) return;
    try {
      await updateSocietyProfile(society.id, {
        description,
        logoUrl,
        instagramLink,
        whatsappLink
      });
      navigation.goBack();
    } catch {}
  };

  if (!society) return null;

  return (
    <ScreenLayout>
      <TopNavBar title="Edit Society Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imagePickerWrap}>
           <TouchableOpacity onPress={pickLogo} style={[styles.logoPreview, { borderColor: theme.colors.border }]}>
             {logoUrl ? (
               <Image source={{ uri: logoUrl }} style={styles.logoImage} />
             ) : (
               <View style={styles.placeholderLogo}>
                 <MaterialIcons name="add-a-photo" size={24} color={theme.colors.textSecondary} />
                 <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>Add Logo</Text>
               </View>
             )}
           </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>About / Description</Text>
        <TextInput
          style={[styles.input, styles.multiLine, { borderColor: theme.colors.border, color: theme.colors.textPrimary, backgroundColor: theme.colors.surface }]}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell everyone what your society is about..."
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Instagram Link</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary, backgroundColor: theme.colors.surface }]}
          value={instagramLink}
          onChangeText={setInstagramLink}
          placeholder="https://instagram.com/..."
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>WhatsApp Group Link</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary, backgroundColor: theme.colors.surface }]}
          value={whatsappLink}
          onChangeText={setWhatsappLink}
          placeholder="https://chat.whatsapp.com/..."
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={{ marginTop: 24 }}>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiLine: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerWrap: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  }
});
