import React, { useState } from 'react';
import { Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStats } from '@/data/adminStats';
import { Card } from '@/components/Card';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatCard } from '@/components/StatCard';
import { TopNavBar } from '@/components/TopNavBar';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { SectionHeader } from '@/components/SectionHeader';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useLocalAppState } from '@/hooks/useLocalAppState';

export const AdminDashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { selectedAdminSocietyId, adminSocieties } = useUserRoles();
  const { allSocieties, events, announcements, polls, activeSocietyMembers } = useLocalAppState();
  
  const [selectedTab, setSelectedTab] = useState<'Overview' | 'Content' | 'Analytics'>('Overview');

  const selectedSociety = adminSocieties.find(s => s.societyId === selectedAdminSocietyId);
  const societyDetails = allSocieties.find(s => s.id === selectedAdminSocietyId);

  if (!selectedSociety || !societyDetails) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialIcons name="admin-panel-settings" size={64} color={theme.colors.textSecondary} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16 }}>
            No Society Selected
          </Text>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            Please select a society to manage from your admin dashboard
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  const societyStats = {
    totalMembers: activeSocietyMembers.length || adminStats.totalMembers,
    eventsThisMonth: events.length || adminStats.eventsThisMonth,
    announcements: announcements.length || adminStats.announcements,
    activePolls: polls.length || 2,
  };

  return (
    <ScreenLayout>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                {selectedSociety.role} Dashboard
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary, marginTop: 4 }}>
                {societyDetails.shortName}
              </Text>
              <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 }}>
                {societyDetails.name}
              </Text>
            </View>
            <RoleSwitcher compact />
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4 }}>
            {(['Overview', 'Content', 'Analytics'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: selectedTab === tab ? theme.colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedTab === tab ? theme.colors.background : theme.colors.textSecondary,
                }}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Overview Tab */}
        {selectedTab === 'Overview' && (
          <>
            {/* Stats Grid */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Key Metrics" />
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                <View style={{ flexGrow: 1, flexBasis: 160 }}>
                  <StatCard label="Members" value={societyStats.totalMembers} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 160 }}>
                  <StatCard label="Events" value={societyStats.eventsThisMonth} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 160 }}>
                  <StatCard label="Posts" value={societyStats.announcements} />
                </View>
                <View style={{ flexGrow: 1, flexBasis: 160 }}>
                  <StatCard label="Active Polls" value={societyStats.activePolls} />
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Quick Actions" />
              <View style={{ gap: 12, marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton label="Create Event" onPress={() => navigation.navigate('CreateEvent')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <OutlineButton label="New Post" onPress={() => navigation.navigate('AnnouncementsFeed')} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <OutlineButton label="Manage Members" onPress={() => navigation.navigate('MainTabs', { screen: 'Members' })} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <OutlineButton label="Edit Profile" onPress={() => navigation.navigate('EditSocietyProfile')} />
                  </View>
                </View>
              </View>
            </View>

            {/* Pending Actions */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Pending Actions" />
              <Card style={{ marginTop: 12 }}>
                <View style={{ gap: 12 }}>
                  <Pressable 
                    onPress={() => Alert.alert('Membership Requests', 'Feature coming soon')}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialIcons name="person-add" size={20} color={theme.colors.primary} />
                      <View>
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Membership Requests</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>7 pending approvals</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: theme.colors.border }} />

                  <Pressable 
                    onPress={() => Alert.alert('Event Reviews', 'Feature coming soon')}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialIcons name="event" size={20} color={theme.colors.primary} />
                      <View>
                        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Event Reviews</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>3 need approval</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>
              </Card>
            </View>

            {/* Recent Activity */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <SectionHeader title="Recent Activity" />
              <Card style={{ marginTop: 12 }}>
                <View style={{ gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialIcons name="person-add" size={16} color={theme.colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>New member joined</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>2 minutes ago</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>Event updated</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>45 minutes ago</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialIcons name="poll" size={16} color={theme.colors.warning} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>New poll created</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>1 hour ago</Text>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          </>
        )}

        {/* Content Tab */}
        {selectedTab === 'Content' && (
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader title="Content Management" />
            <View style={{ gap: 16, marginTop: 16 }}>
              <Pressable
                onPress={() => navigation.navigate('CreateEvent')}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <MaterialIcons name="event" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>Events</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create and manage events</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('AnnouncementsFeed')}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <MaterialIcons name="article" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>Announcements</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create posts and updates</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('MainTabs', { screen: 'Polls' })}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <MaterialIcons name="poll" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary }}>Polls</Text>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Create and manage polls</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'Analytics' && (
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader title="Analytics Dashboard" />
            <Card style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 16 }}>
                Engagement Overview
              </Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textSecondary }}>Event Attendance Rate</Text>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>78%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textSecondary }}>Member Growth</Text>
                  <Text style={{ color: theme.colors.success, fontWeight: '600' }}>+12%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.colors.textSecondary }}>Poll Participation</Text>
                  <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>64%</Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};
