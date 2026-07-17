import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/api/auth';

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
  email?: string;
  password?: string;
};

export const LoginScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (isSubmitting) {
      return;
    }

    const errors: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Enter your password.';
    }
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      navigation.replace('MainTabs');
    } catch (error) {
      setErrorMessage(authErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenLayout>
      <View style={[styles.container, { paddingHorizontal: theme.spacing.lg }]}>
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
          title="Welcome back"
          subtitle="Sign in to continue to your societies, events, and polls."
        />

        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
          <InputField
            label="Email"
            placeholder="name@manchester.ac.uk"
            keyboardType="email-address"
            icon="mail-outline"
            value={email}
            onChangeText={(value: string) => {
              setEmail(value);
              setFieldErrors((prev: FieldErrors) => ({ ...prev, email: undefined }));
            }}
            {...(fieldErrors.email ? { error: fieldErrors.email } : {})}
          />
          <InputField
            label="Password"
            placeholder="Your password"
            secureTextEntry
            icon="lock-outline"
            value={password}
            onChangeText={(value: string) => {
              setPassword(value);
              setFieldErrors((prev: FieldErrors) => ({ ...prev, password: undefined }));
            }}
            {...(fieldErrors.password ? { error: fieldErrors.password } : {})}
          />

          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

          <PrimaryButton label="Sign In" size="lg" onPress={handleSignIn} loading={isSubmitting} />
        </View>

        <View style={[styles.footerLink, { marginTop: theme.spacing.lg }]}>
          <TextButton label="New here? Create an account" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  footerLink: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center'
  }
});
