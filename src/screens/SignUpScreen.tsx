import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '@/components/InputField';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const SignUpScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => navigation.goBack()}>
        Back
      </Text>
      <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>Create Account</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Join your society with your university email.</Text>

      <View style={{ gap: 8 }}>
        <OutlineButton label="Continue with Google" onPress={() => navigation.navigate('ProfileSetup')} />
        <OutlineButton label="Continue with Apple" onPress={() => navigation.navigate('ProfileSetup')} />
      </View>

      <Text style={{ textAlign: 'center', color: theme.colors.textSecondary }}>or continue with email</Text>

      <InputField label="Full Name" placeholder="Your full name" />
      <InputField label="University Email" placeholder="name@manchester.ac.uk" />
      <InputField label="Password" placeholder="Create password" secureTextEntry />
      <InputField label="Confirm Password" placeholder="Repeat password" secureTextEntry />
      <View style={{ marginTop: 8 }}>
        <PrimaryButton label="Get Started" onPress={() => navigation.navigate('ProfileSetup')} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <TextButton label="Already have an account? Log In" onPress={() => navigation.navigate('Login')} />
      </View>
      </View>
    </ScreenLayout>
  );
};
