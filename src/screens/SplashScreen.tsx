import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { societyConfig } from '@/config/societyConfig';
import { RootStackParamList } from '@/navigation/types';
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.markCircle, { backgroundColor: theme.colors.surfaceSunken }]}>
        <MaterialIcons name="groups" size={44} color={theme.colors.textPrimary} />
      </View>
      <Text style={[theme.typography.display, { color: theme.colors.textPrimary }]}>SocietyHub</Text>
      <Text
        style={[theme.typography.captionMedium, styles.subline, { color: theme.colors.textSecondary }]}
      >
        {societyConfig.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  markCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subline: {
    marginTop: 6,
    opacity: 0.85
  }
});
