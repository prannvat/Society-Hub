import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeader } from '@/components/SectionHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { SocietyPerk } from '@/types';
import { addSocietyPerk, fetchSocietyPerks, removeSocietyPerk } from '@/services/api/perks';

export const EditSocietyProfileScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { allSocieties, activeSocietyId, updateSocietyProfile } = useLocalAppState();

  const society = allSocieties.find(s => s.id === activeSocietyId);

  const [description, setDescription] = useState(society?.description || '');
  const [logoUrl, setLogoUrl] = useState(society?.logoUrl || '');
  const [instagramLink, setInstagramLink] = useState(society?.instagramLink || '');
  const [whatsappLink, setWhatsappLink] = useState(society?.whatsappLink || '');
  const [isSaving, setIsSaving] = useState(false);

  // Member perks — the committee-managed rewards this society offers.
  const societyId = society?.id;
  const [perks, setPerks] = useState<SocietyPerk[]>([]);
  const [newPerkTitle, setNewPerkTitle] = useState('');
  const [newPerkDescription, setNewPerkDescription] = useState('');
  const [isAddingPerk, setIsAddingPerk] = useState(false);

  useEffect(() => {
    if (!societyId) {
      return;
    }
    let cancelled = false;
    fetchSocietyPerks(societyId)
      .then((result) => {
        if (!cancelled) setPerks(result);
      })
      .catch(() => {
        // Endpoint not up yet — start from an empty list; adds still work optimistically.
      });
    return () => {
      cancelled = true;
    };
  }, [societyId]);

  const handleAddPerk = async () => {
    const title = newPerkTitle.trim();
    if (!societyId || !title || isAddingPerk) {
      if (!title) toast.show('Give the perk a title first', 'info');
      return;
    }
    setIsAddingPerk(true);
    try {
      const created = await addSocietyPerk(societyId, { title, description: newPerkDescription.trim() });
      setPerks((prev) => [...prev, created]);
      setNewPerkTitle('');
      setNewPerkDescription('');
      toast.show('Perk added', 'success');
    } catch {
      toast.show('Unable to add perk right now. Please try again.', 'error');
    } finally {
      setIsAddingPerk(false);
    }
  };

  const handleRemovePerk = async (perkId: string) => {
    if (!societyId) {
      return;
    }
    const previous = perks;
    setPerks((prev) => prev.filter((perk) => perk.id !== perkId));
    try {
      await removeSocietyPerk(societyId, perkId);
      toast.show('Perk removed', 'success');
    } catch {
      setPerks(previous);
      toast.show('Unable to remove perk right now. Please try again.', 'error');
    }
  };

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
      const dataUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setLogoUrl(dataUri);
    }
  };

  const handleSave = async () => {
    if (!society) return;
    setIsSaving(true);
    try {
      await updateSocietyProfile(society.id, {
        description,
        logoUrl,
        instagramLink,
        whatsappLink
      });
      toast.show('Society profile saved', 'success');
      navigation.goBack();
    } catch {
      toast.show('Unable to save changes right now. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!society) return null;

  return (
    <ScreenLayout>
      <TopNavBar title="Edit Society Profile" subtitle={society.name} onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.imagePickerWrap}>
          <Pressable
            onPress={pickLogo}
            accessibilityRole="button"
            accessibilityLabel="Choose society logo"
            style={({ pressed }) => [
              styles.logoPreview,
              {
                borderColor: pressed ? theme.colors.primary : theme.colors.borderStrong,
                backgroundColor: theme.colors.surfaceSunken,
                opacity: pressed ? 0.85 : 1
              }
            ]}
          >
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoImage} />
            ) : (
              <View style={styles.placeholderLogo}>
                <MaterialIcons name="add-a-photo" size={24} color={theme.colors.textSecondary} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  Add logo
                </Text>
              </View>
            )}
          </Pressable>
          {logoUrl ? (
            <Text
              style={[theme.typography.captionMedium, { color: theme.colors.primary }]}
              onPress={pickLogo}
              suppressHighlighting
            >
              Change logo
            </Text>
          ) : null}
        </View>

        {/* About */}
        <View style={styles.section}>
          <SectionHeader title="About" />
          <InputField
            label="Description"
            placeholder="Tell everyone what your society is about..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Links */}
        <View style={styles.section}>
          <SectionHeader title="Links" />
          <InputField
            label="Instagram"
            placeholder="https://instagram.com/..."
            value={instagramLink}
            onChangeText={setInstagramLink}
            icon="link"
            autoCapitalize="none"
          />
          <InputField
            label="WhatsApp group"
            placeholder="https://chat.whatsapp.com/..."
            value={whatsappLink}
            onChangeText={setWhatsappLink}
            icon="link"
            autoCapitalize="none"
          />
        </View>

        {/* Member perks — rewards the committee offers to members */}
        <View style={styles.section}>
          <SectionHeader title="Member perks" />
          {perks.length > 0 ? (
            <View style={styles.perkList}>
              {perks.map((perk) => (
                <View
                  key={perk.id}
                  style={[
                    styles.perkRow,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.card
                    }
                  ]}
                >
                  <View style={[styles.perkIcon, { backgroundColor: theme.colors.primarySoft }]}>
                    <MaterialIcons name="card-giftcard" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.perkText}>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {perk.title}
                    </Text>
                    {perk.description ? (
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {perk.description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleRemovePerk(perk.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove perk ${perk.title}`}
                    style={({ pressed }) => [styles.perkRemove, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <MaterialIcons name="delete-outline" size={22} color={theme.colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
              No perks yet. Add one below to reward your members.
            </Text>
          )}
          <InputField
            label="Perk title"
            placeholder="e.g. 10% off at the union bar"
            value={newPerkTitle}
            onChangeText={setNewPerkTitle}
          />
          <InputField
            label="Description"
            placeholder="Add a short detail members will see..."
            value={newPerkDescription}
            onChangeText={setNewPerkDescription}
            multiline
          />
          <PrimaryButton
            label="Add perk"
            variant="secondary"
            icon="add"
            onPress={handleAddPerk}
            loading={isAddingPerk}
          />
        </View>

        <PrimaryButton label="Save Changes" onPress={handleSave} loading={isSaving} />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  imagePickerWrap: {
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
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
  },
  perkList: {
    gap: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 60,
  },
  perkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    flex: 1,
    gap: 2,
  },
  perkRemove: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
