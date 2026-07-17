import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/services/api/auth';

export const LoginScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSignIn = async () => {
    if (!canSubmit) {
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
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>Log In</Text>
        <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
          Welcome back. Sign in to continue to your societies, events, and polls.
        </Text>

        <InputField
          label="Email"
          placeholder="name@manchester.ac.uk"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          label="Password"
          placeholder="Your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

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

        <View style={{ gap: 8 }}>
          {isSubmitting ? (
            <View style={{ minHeight: 50, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : (
            <PrimaryButton label="Sign In" onPress={handleSignIn} disabled={!canSubmit} />
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <TextButton label="New here? Create an account" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </View>
    </ScreenLayout>
  );
};
