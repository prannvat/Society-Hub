import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';

export const LoginScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loginWithAuth0 } = useAuth();

  const continueWithAuth = async () => {
    const success = await loginWithAuth0();
    if (success) {
      navigation.replace('MainTabs');
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
        Welcome back. Use one tap to continue to your societies, events, and polls.
      </Text>

      <View style={{ gap: 8 }}>
        <PrimaryButton label="Continue" onPress={continueWithAuth} />
        <OutlineButton label="Use Auth0" onPress={continueWithAuth} />
      </View>

      <View
        style={{
          marginTop: 6,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          backgroundColor: theme.colors.surface,
          padding: 12
        }}
      >
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>First time here?</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 }}>
          Tap Continue to enter the app. You can finish profile details after entering.
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <TextButton label="New here? Create an account" onPress={() => navigation.navigate('SignUp')} />
      </View>
      </View>
    </ScreenLayout>
  );
};
