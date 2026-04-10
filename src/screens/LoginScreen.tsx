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

export const LoginScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <Text style={{ color: theme.colors.primary, fontWeight: '700' }} onPress={() => navigation.goBack()}>
        Back
      </Text>
      <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>Log In</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Welcome back. Continue where you left off.</Text>

      <View style={{ gap: 8 }}>
        <OutlineButton label="Continue with Google" onPress={() => navigation.replace('MainTabs')} />
      </View>

      <Text style={{ textAlign: 'center', color: theme.colors.textSecondary }}>or use email</Text>

      <InputField label="University Email" placeholder="name@manchester.ac.uk" />
      <InputField label="Password" placeholder="Enter password" secureTextEntry />
      <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Forgot Password?</Text>
      <View style={{ marginTop: 8 }}>
        <PrimaryButton label="Continue" onPress={() => navigation.replace('MainTabs')} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <TextButton label="New here? Create an account" onPress={() => navigation.navigate('SignUp')} />
      </View>
      </View>
    </ScreenLayout>
  );
};
