import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { categoryChipVariant, formatRelativeTime } from '@/components/AnnouncementCard';
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
      <ScreenLayout scroll={false}>
        <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Announcement not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  const body = remoteBody ?? announcement.body ?? announcement.preview;
  const hasFullBody = Boolean(remoteBody || announcement.body);

  return (
    <ScreenLayout scroll={false}>
      <TopNavBar title="Announcement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category + metadata */}
        <View style={styles.metaRow}>
          <BadgeChip label={announcement.category} variant={categoryChipVariant(announcement.category)} />
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {formatRelativeTime(announcement.timestamp)}
          </Text>
        </View>

        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>{announcement.title}</Text>

        <View style={styles.bylineRow}>
          <MaterialIcons name="person-outline" size={15} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
            {remoteAuthor ?? announcement.authorName}
          </Text>
          <View style={[styles.bylineDot, { backgroundColor: theme.colors.textTertiary }]} />
          <MaterialIcons name="visibility" size={15} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {announcement.readCount} reads
          </Text>
        </View>

        <Card>
          <Text style={[theme.typography.body, styles.bodyText, { color: theme.colors.textPrimary }]}>{body}</Text>
          {!hasFullBody && (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Full announcement details are not available for this entry yet.
            </Text>
          )}
        </Card>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  bylineDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 3
  },
  bodyText: {
    lineHeight: 24
  }
});
