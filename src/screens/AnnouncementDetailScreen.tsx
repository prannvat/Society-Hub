import React from 'react';
import { Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { TopNavBar } from '@/components/TopNavBar';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const AnnouncementDetailScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AnnouncementDetail'>>();
  const { announcements } = useLocalAppState();
  const announcement = announcements.find((entry) => entry.id === route.params?.announcementId) ?? announcements[0];

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
      <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <BadgeChip label={announcement.category} variant="outlined" />
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{announcement.timestamp}</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>{announcement.title}</Text>

      <Card>
        <Text style={{ color: theme.colors.textPrimary, lineHeight: 22 }}>{announcement.preview}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
          This is a locally rendered full announcement body so the flow is complete before backend integration.
        </Text>
      </Card>

      <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12 }}>
        <Text style={{ color: theme.colors.textSecondary }}>Posted by</Text>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 4 }}>{announcement.authorName}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>{announcement.readCount} reads</Text>
      </View>
      </View>
    </ScreenLayout>
  );
};
