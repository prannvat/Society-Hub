import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { adminStats } from '@/data/adminStats';
import { Card } from '@/components/Card';
import { OutlineButton } from '@/components/OutlineButton';
import { StatCard } from '@/components/StatCard';
import { TopNavBar } from '@/components/TopNavBar';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';

export const AdminDashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
      <TopNavBar title="Admin Panel" actionLabel="Settings" onPressAction={() => navigation.navigate('Settings')} />

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <StatCard label="Total Members" value={adminStats.totalMembers} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <StatCard label="Events This Month" value={adminStats.eventsThisMonth} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <StatCard label="Announcements" value={adminStats.announcements} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <StatCard label="Active Now" value={adminStats.activeNow} />
        </View>
      </View>

      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Quick Actions</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <OutlineButton label="Create Event" onPress={() => navigation.navigate('CreateEvent')} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <OutlineButton label="Post Announcement" onPress={() => navigation.navigate('AnnouncementsFeed')} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <OutlineButton label="Manage Members" onPress={() => navigation.navigate('MainTabs', { screen: 'Members' })} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160 }}>
          <OutlineButton label="View Reports" onPress={() => navigation.navigate('Settings')} />
        </View>
      </View>

      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 6 }}>Recent Activity</Text>
      <Card>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>• John joined society</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 3 }}>2 mins ago</Text>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 10 }}>• Baisakhi event updated</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 3 }}>45 mins ago</Text>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 10 }}>• New report submitted</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 3 }}>1 hour ago</Text>
      </Card>

      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 6 }}>Pending Actions</Text>
      <Card>
        <Text style={{ color: theme.colors.textSecondary }}>Membership requests: 7</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>Event approvals: 3</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>Reports flagged: 1</Text>
      </Card>
      </View>
    </ScreenLayout>
  );
};
