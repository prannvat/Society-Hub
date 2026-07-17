import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryPressed]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.markCircle}>
        <MaterialIcons name="groups" size={44} color={theme.colors.textOnPrimary} />
      </View>
      <Text style={[theme.typography.display, { color: theme.colors.textOnPrimary }]}>SocietyHub</Text>
      <Text
        style={[
          theme.typography.captionMedium,
          styles.subline,
          { color: theme.colors.textOnPrimary }
        ]}
      >
        {societyConfig.name}
      </Text>
    </LinearGradient>
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
    justifyContent: 'center',
    // Translucent brand-glass layer on the gradient — intentionally not a theme token.
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },
  subline: {
    marginTop: 6,
    opacity: 0.85
  }
});
