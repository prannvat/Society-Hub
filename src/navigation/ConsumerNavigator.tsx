import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HomeScreen } from '@/screens/HomeScreen';
import { MySocietiesScreen } from '@/screens/MySocietiesScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

export type ConsumerTabParamList = {
  Discover: undefined;
  MySocieties: undefined;
  Events: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ConsumerTabParamList>();

export const ConsumerNavigator = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 82 : 68,
          paddingBottom: Platform.OS === 'ios' ? 18 : 10,
          paddingTop: Platform.OS === 'ios' ? 8 : 6,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          elevation: Platform.OS === 'android' ? 8 : 0,
          shadowColor: Platform.OS === 'ios' ? '#000000' : undefined,
          shadowOffset: Platform.OS === 'ios' ? { width: 0, height: -2 } : undefined,
          shadowOpacity: Platform.OS === 'ios' ? 0.08 : undefined,
          shadowRadius: Platform.OS === 'ios' ? 8 : undefined
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ color, size }) => {
          const iconNameMap: Record<keyof ConsumerTabParamList, keyof typeof MaterialIcons.glyphMap> = {
            Discover: 'explore',
            MySocieties: 'favorite',
            Events: 'event',
            Profile: 'person'
          };

          return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
        }
      })}
    >
      <Tab.Screen 
        name="Discover" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen 
        name="MySocieties" 
        component={MySocietiesScreen}
        options={{ tabBarLabel: 'My Societies' }}
      />
      <Tab.Screen 
        name="Events" 
        component={ExploreScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};