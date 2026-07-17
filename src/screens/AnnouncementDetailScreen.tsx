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
import { fetchAnnouncementDetail } from '@/services/api';

export const AnnouncementDetailScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AnnouncementDetail'>>();
  const { announcements } = useLocalAppState();
  const [remoteBody, setRemoteBody] = React.useState<string | null>(null);
  const [remoteAuthor, setRemoteAuthor] = React.useState<string | null>(null);
  const announcement = announcements.find((entry) => entry.id === route.params?.announcementId) ?? announcements[0];

  React.useEffect(() => {
    const announcementId = route.params?.announcementId;
    if (!announcementId) {
      return;
    }

    (async () => {
      try {
        const detail = await fetchAnnouncementDetail(announcementId);
        setRemoteBody(detail.body ?? null);
        setRemoteAuthor(detail.createdBy?.fullName ?? null);
      } catch {
        setRemoteBody(null);
        setRemoteAuthor(null);
      }
    })();
  }, [route.params?.announcementId]);

  if (!announcement) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 16 }}>
          <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700' }}>Announcement not found</Text>
        </View>
      </ScreenLayout>
    );
  }

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
        <Text style={{ color: theme.colors.textPrimary, lineHeight: 22 }}>{remoteBody ?? announcement.body ?? announcement.preview}</Text>
        {remoteBody || announcement.body ? null : (
          <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
            Full announcement details are not available for this entry yet.
          </Text>
        )}
      </Card>

      <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: 12 }}>
        <Text style={{ color: theme.colors.textSecondary }}>Posted by</Text>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', marginTop: 4 }}>{remoteAuthor ?? announcement.authorName}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>{announcement.readCount} reads</Text>
      </View>
      </View>
    </ScreenLayout>
  );
};
