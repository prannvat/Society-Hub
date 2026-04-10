import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TextButton } from '@/components/TextButton';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const OnboardingScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [step, setStep] = React.useState(0);

  const steps = [
    {
      title: 'Welcome to SocietyHub',
      subtitle: 'Discover communities, events, and people from your university.'
    },
    {
      title: 'Find What Matters',
      subtitle: 'Follow announcements, RSVP quickly, and stay in the loop.'
    },
    {
      title: 'Build Your Network',
      subtitle: 'Vote in live polls, connect with committee leaders, and join meaningful activities.'
    }
  ];

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40, gap: 16 }}>
      <View style={{ height: 320, borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }} />
      <View
        style={{
          marginTop: -76,
          marginHorizontal: 8,
          borderRadius: 20,
          padding: 18,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          gap: 12
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary }}>{steps[step].title}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{steps[step].subtitle}</Text>

        <View style={{ marginTop: 8 }}>
          {step < steps.length - 1 ? (
            <PrimaryButton label="Next" onPress={() => setStep((prev) => prev + 1)} />
          ) : (
            <PrimaryButton label="Join Society" onPress={() => navigation.navigate('SignUp')} />
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <TextButton label="Already a member? Log in" onPress={() => navigation.navigate('Login')} />
        </View>

        {step > 0 ? (
          <Pressable onPress={() => setStep((prev) => prev - 1)}>
            <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', fontWeight: '600' }}>Back</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 }}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === step ? 22 : 8,
              height: 8,
              borderRadius: 100,
              backgroundColor: index === step ? theme.colors.primary : theme.colors.border
            }}
          />
        ))}
      </View>
      </View>
    </ScreenLayout>
  );
};
