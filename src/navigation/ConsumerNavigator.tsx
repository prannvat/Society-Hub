import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAccountSwitcher } from '@/hooks/useAccountSwitcher';
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
  const { openSwitcher } = useAccountSwitcher();
  const lastProfileTap = React.useRef(0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...getTabNavigatorOptions(theme),
        // Instagram-style: outline when inactive, filled when the tab is active.
        tabBarIcon: ({ color, size, focused }) => {
          const iconNameMap: Record<
            keyof ConsumerTabParamList,
            [keyof typeof MaterialCommunityIcons.glyphMap, keyof typeof MaterialCommunityIcons.glyphMap]
          > = {
            Home: ['home-outline', 'home'],
            Explore: ['compass-outline', 'compass'],
            Events: ['calendar-blank-outline', 'calendar-blank'],
            Profile: ['account-outline', 'account']
          };

          const [outline, filled] = iconNameMap[route.name];
          return (
            <MaterialCommunityIcons name={focused ? filled : outline} size={size ?? 26} color={color} />
          );
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
        listeners={{
          tabPress: () => {
            const now = Date.now();
            if (now - lastProfileTap.current < 350) {
              openSwitcher();
            }
            lastProfileTap.current = now;
          },
        }}
      />
    </Tab.Navigator>
  );
};
