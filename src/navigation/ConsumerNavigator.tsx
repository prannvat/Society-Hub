import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getTabNavigatorOptions } from './tabOptions';
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
        ...getTabNavigatorOptions(theme),
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
