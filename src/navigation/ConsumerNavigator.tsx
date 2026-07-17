import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getTabNavigatorOptions } from './tabOptions';
import { FeedScreen } from '@/screens/FeedScreen';
import { ExploreSocietiesScreen } from '@/screens/ExploreSocietiesScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

export type ConsumerTabParamList = {
  Home: undefined;
  Explore: undefined;
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
            Home: 'home',
            Explore: 'explore',
            Events: 'event',
            Profile: 'person'
          };

          return <MaterialIcons name={iconNameMap[route.name]} size={size ?? 22} color={color} />;
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreSocietiesScreen}
        options={{ tabBarLabel: 'Explore' }}
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
