import React from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LocalAppStateProvider } from '@/hooks/useLocalAppState';
import { AuthProvider } from '@/hooks/useAuth';
import { UserRolesProvider } from '@/hooks/useUserRoles';
import { CommitteeRequestsProvider } from '@/hooks/useCommitteeRequests';
import { ToastProvider } from '@/components/Toast';
import { AccountSwitcherProvider } from '@/hooks/useAccountSwitcher';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthProvider>
      <UserRolesProvider>
        <CommitteeRequestsProvider>
          <LocalAppStateProvider>
            <ToastProvider>
              <AccountSwitcherProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </AccountSwitcherProvider>
            </ToastProvider>
          </LocalAppStateProvider>
        </CommitteeRequestsProvider>
      </UserRolesProvider>
    </AuthProvider>
  );
}
