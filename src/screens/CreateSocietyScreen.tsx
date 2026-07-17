import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenLayout } from './ScreenLayout';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { InputField } from '@/components/InputField';
import { Card } from '@/components/Card';
import { useToast } from '@/components/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateSociety'>;

type FieldErrors = {
  name?: string;
  description?: string;
  universityLink?: string;
};

export const CreateSocietyScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { createSociety } = useLocalAppState();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universityLink, setUniversityLink] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Society name is required';
    }
    if (!description.trim()) {
      nextErrors.description = 'Description is required';
    }
    if (!universityLink.trim()) {
      nextErrors.universityLink = 'A Student Union link is required';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createSociety({
        name: name.trim(),
        shortName: name.trim().split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 4),
        university: 'Default University', // Would come from user profile/SSO
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        description: description.trim()
      });

      setIsSubmitting(false);
      toast.show('Society created — you are now the President', 'success');
      navigation.goBack();
    } catch {
      setIsSubmitting(false);
      toast.show('Unable to create society right now. Please try again.', 'error');
    }
  };

  return (
    <ScreenLayout scroll={false}>
      <View style={{ flex: 1 }}>
        <TopNavBar title="Request New Society" onBack={() => navigation.goBack()} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Card>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.primarySoft }]}>
                  <MaterialIcons name="verified-user" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
                    Official University Group
                  </Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    To ensure platform safety, all new societies must be verified. Please provide a link to your society's official page on your Student Union website as proof of recognition.
                  </Text>
                </View>
              </View>
            </Card>

            <InputField
              label="Society name"
              placeholder="e.g. Computer Science Society"
              value={name}
              onChangeText={setName}
              icon="groups"
              error={errors.name}
            />

            <InputField
              label="Description"
              placeholder="What is this society about?"
              value={description}
              onChangeText={setDescription}
              multiline
              error={errors.description}
            />

            <InputField
              label="Proof of SU recognition (URL)"
              placeholder="https://su.university.edu/societies/..."
              value={universityLink}
              onChangeText={setUniversityLink}
              icon="link"
              autoCapitalize="none"
              error={errors.universityLink}
            />

            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                label="Submit Society Request"
                icon="send"
                loading={isSubmitting}
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
