import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from './ScreenLayout';
import { TopNavBar } from '@/components/TopNavBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RootStackParamList } from '@/navigation/types';
import { useLocalAppState } from '@/hooks/useLocalAppState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateSociety'>;

export const CreateSocietyScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const { createSociety } = useLocalAppState();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universityLink, setUniversityLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !universityLink.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields to submit your society request.');
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
      Alert.alert(
        'Request Approved!',
        'Your society has been created and you are now the President. You can assign committee roles from member profiles.',
        [{ text: 'Great', onPress: () => navigation.goBack() }]
      );
    } catch {
      setIsSubmitting(false);
      Alert.alert('Request Failed', 'Unable to create society right now. Please try again.');
    }
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <TopNavBar title="Request New Society" onBack={() => navigation.goBack()} />
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={{ marginBottom: 24, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 12 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              Official University Group
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
              To ensure platform safety, all new societies must be verified. Please provide a link to your society's official page on your Student Union website as proof of recognition.
            </Text>
          </View>

          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: 8, marginLeft: 4 }}>Society Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Computer Science Society"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          />

          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this society about?"
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border, height: 100, paddingTop: 16 }]}
          />

          <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: 8, marginLeft: 4, marginTop: 16 }}>Proof of SU Recognition (URL)</Text>
          <TextInput
            value={universityLink}
            onChangeText={setUniversityLink}
            placeholder="https://su.university.edu/societies/..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            keyboardType="url"
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          />

          <View style={{ marginTop: 32, opacity: isSubmitting ? 0.7 : 1 }}>
            <PrimaryButton 
              label={isSubmitting ? "Submitting..." : "Submit Society Request"} 
              onPress={isSubmitting ? undefined : handleSubmit} 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  }
});
