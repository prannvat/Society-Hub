import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/api/auth';
import { ApiUniversitySummary, fetchUniversities } from '@/services/api/universities';

const MIN_PASSWORD_LENGTH = 8;

export const SignUpScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universities, setUniversities] = useState<ApiUniversitySummary[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchUniversities();
        if (!cancelled) {
          setUniversities(list);
        }
      } catch {
        // University selection is optional — hide the picker if the list fails to load.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedUniversity = universities.find((entry) => entry.id === selectedUniversityId);

  const validate = (): string | null => {
    if (!fullName.trim()) {
      return 'Please enter your full name.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleSignUp = async () => {
    if (isSubmitting) {
      return;
    }

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(selectedUniversityId ? { universityId: selectedUniversityId } : {}),
      });
      navigation.navigate('ProfileSetup');
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>Create Account</Text>
        <Text style={{ color: theme.colors.textSecondary }}>Join your society with your university email.</Text>

        <InputField label="Full Name" placeholder="Your full name" value={fullName} onChangeText={setFullName} />
        <InputField
          label="University Email"
          placeholder="name@manchester.ac.uk"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          label="Password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label="Confirm Password"
          placeholder="Repeat password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {universities.length > 0 ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary }}>
              University (optional)
            </Text>
            <Pressable
              onPress={() => setShowUniversityList((prev) => !prev)}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 8,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{ color: selectedUniversity ? theme.colors.textPrimary : theme.colors.textSecondary }}>
                {selectedUniversity ? selectedUniversity.name : 'Select your university'}
              </Text>
              <MaterialIcons
                name={showUniversityList ? 'expand-less' : 'expand-more'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>
            {showUniversityList ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  backgroundColor: theme.colors.surface,
                  maxHeight: 240,
                  overflow: 'hidden'
                }}
              >
                <ScrollView nestedScrollEnabled>
                  <Pressable
                    onPress={() => {
                      setSelectedUniversityId(null);
                      setShowUniversityList(false);
                    }}
                    style={{ paddingHorizontal: 14, paddingVertical: 12 }}
                  >
                    <Text style={{ color: theme.colors.textSecondary }}>No university</Text>
                  </Pressable>
                  {universities.map((university) => (
                    <Pressable
                      key={university.id}
                      onPress={() => {
                        setSelectedUniversityId(university.id);
                        setShowUniversityList(false);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Text style={{ color: theme.colors.textPrimary, flex: 1, paddingRight: 8 }}>
                        {university.name}
                      </Text>
                      {selectedUniversityId === university.id ? (
                        <MaterialIcons name="check" size={18} color={theme.colors.primary} />
                      ) : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

        {errorMessage ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.colors.error,
              borderRadius: 12,
              padding: 12,
              backgroundColor: theme.colors.surface
            }}
          >
            <Text style={{ color: theme.colors.error, fontWeight: '600' }}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 8 }}>
          {isSubmitting ? (
            <View style={{ minHeight: 50, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <PrimaryButton label="Get Started" onPress={handleSignUp} />
          )}
        </View>
        <View style={{ alignItems: 'center' }}>
          <TextButton label="Already have an account? Log In" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};
