import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { societyConfig } from '@/config/societyConfig';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';

export const SplashScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isRestoring, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isRestoring) {
      return;
    }
    navigation.replace(isAuthenticated ? 'MainTabs' : 'Onboarding');
  }, [isRestoring, isAuthenticated, navigation]);

  return (
    <ScreenLayout scroll={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.primary, borderRadius: 24 }]}> 
        <Text style={[styles.logo, { color: theme.colors.background }]}>{societyConfig.shortName}</Text>
        <Text style={[styles.title, { color: theme.colors.background }]}>{societyConfig.name}</Text>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900'
  },
  title: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});
