import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { ListRow } from '@/components/ListRow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/api/auth';
import { ApiUniversitySummary, fetchUniversities } from '@/services/api/universities';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Inline alert for API-level auth errors (screen-local by design). */
const ErrorBanner = ({ message }: { message: string }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.errorBanner,
        { borderRadius: theme.radius.card, backgroundColor: theme.colors.dangerSoft }
      ]}
    >
      <MaterialIcons name="error-outline" size={20} color={theme.colors.danger} />
      <Text style={[theme.typography.captionMedium, styles.errorText, { color: theme.colors.danger }]}>
        {message}
      </Text>
    </View>
  );
};

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export const SignUpScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SignUp'>>();
  const isAddMode = route.params?.mode === 'add';
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universities, setUniversities] = useState<ApiUniversitySummary[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev: FieldErrors) => ({ ...prev, [field]: undefined }));
  };

  const handleSignUp = async () => {
    if (isSubmitting) {
      return;
    }

    const errors: FieldErrors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Enter your full name.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
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
      if (isAddMode) {
        // Added another account while signed in — pop Login + SignUp back into the app.
        navigation.pop(2);
      } else {
        navigation.navigate('ProfileSetup');
      }
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textSecondary} />
        </Pressable>

        <ScreenHeader
          title="Create Account"
          subtitle="Join your society with your university email."
        />

        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
          <InputField
            label="Full Name"
            placeholder="Your full name"
            icon="person-outline"
            autoCapitalize="words"
            value={fullName}
            onChangeText={(value: string) => {
              setFullName(value);
              clearFieldError('fullName');
            }}
            {...(fieldErrors.fullName ? { error: fieldErrors.fullName } : {})}
          />
          <InputField
            label="University Email"
            placeholder="name@manchester.ac.uk"
            keyboardType="email-address"
            icon="mail-outline"
            value={email}
            onChangeText={(value: string) => {
              setEmail(value);
              clearFieldError('email');
            }}
            {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
          />
          <InputField
            label="Password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            secureTextEntry
            icon="lock-outline"
            value={password}
            onChangeText={(value: string) => {
              setPassword(value);
              clearFieldError('password');
            }}
            {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
          />
          <InputField
            label="Confirm Password"
            placeholder="Repeat password"
            secureTextEntry
            icon="lock-outline"
            value={confirmPassword}
            onChangeText={(value: string) => {
              setConfirmPassword(value);
              clearFieldError('confirmPassword');
            }}
            {...(fieldErrors.confirmPassword ? { error: fieldErrors.confirmPassword } : {})}
          />

          {universities.length > 0 ? (
            <View style={{ gap: 6 }}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                University (optional)
              </Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                We'll match you automatically from your uni email — or pick manually.
              </Text>
              <Pressable
                onPress={() => setShowUniversityList((prev: boolean) => !prev)}
                style={({ pressed }) => [
                  styles.pickerTrigger,
                  {
                    borderColor: showUniversityList ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.radius.input,
                    backgroundColor: pressed ? theme.colors.surfaceSunken : theme.colors.surface
                  }
                ]}
                accessibilityRole="button"
                accessibilityLabel="Choose your university"
              >
                <MaterialIcons
                  name="school"
                  size={20}
                  color={selectedUniversity ? theme.colors.primary : theme.colors.textTertiary}
                />
                <Text
                  style={[
                    theme.typography.body,
                    styles.pickerLabel,
                    { color: selectedUniversity ? theme.colors.textPrimary : theme.colors.textTertiary }
                  ]}
                  numberOfLines={1}
                >
                  {selectedUniversity ? selectedUniversity.name : 'Select your university'}
                </Text>
                <MaterialIcons
                  name={showUniversityList ? 'expand-less' : 'expand-more'}
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
              {showUniversityList ? (
                <View
                  style={[
                    styles.pickerList,
                    {
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.card,
                      backgroundColor: theme.colors.surface
                    },
                    theme.elevation.e1
                  ]}
                >
                  <ScrollView nestedScrollEnabled>
                    <ListRow
                      title="No university"
                      subtitle="You can add this later"
                      leading={<MaterialIcons name="remove-circle-outline" size={20} color={theme.colors.textTertiary} />}
                      trailing={
                        selectedUniversityId === null ? (
                          <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                        ) : undefined
                      }
                      onPress={() => {
                        setSelectedUniversityId(null);
                        setShowUniversityList(false);
                      }}
                    />
                    {universities.map((university) => (
                      <View
                        key={university.id}
                        style={[styles.pickerDivider, { borderTopColor: theme.colors.border }]}
                      >
                        <ListRow
                          title={university.name}
                          leading={<MaterialIcons name="school" size={20} color={theme.colors.textTertiary} />}
                          trailing={
                            selectedUniversityId === university.id ? (
                              <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                            ) : undefined
                          }
                          onPress={() => {
                            setSelectedUniversityId(university.id);
                            setShowUniversityList(false);
                          }}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          ) : null}

          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

          <PrimaryButton label="Get Started" size="lg" onPress={handleSignUp} loading={isSubmitting} />
        </View>

        <View style={[styles.footerLink, { marginTop: theme.spacing.lg }]}>
          <TextButton label="Already have an account? Log In" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 40
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    marginBottom: 8
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14
  },
  errorText: {
    flex: 1
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: 14,
    marginTop: 2
  },
  pickerLabel: {
    flex: 1
  },
  pickerList: {
    borderWidth: 1,
    maxHeight: 264,
    overflow: 'hidden'
  },
  pickerDivider: {
    borderTopWidth: 1
  },
  footerLink: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  }
});
