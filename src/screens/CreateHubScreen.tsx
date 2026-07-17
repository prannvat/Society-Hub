import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { EmptyState } from '@/components/EmptyState';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FormatIcon = ({ name }: { name: keyof typeof MaterialIcons.glyphMap }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.formatIcon, { backgroundColor: theme.colors.primarySoft }]}>
      <MaterialIcons name={name} size={20} color={theme.colors.primary} />
    </View>
  );
};

/**
 * Global "＋ Create" sheet for committee members: pick which society you're posting
 * as, then choose Post / Event / Poll. No mode switch — creation is contextual.
 */
export const CreateHubScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateHub'>>();
  const { adminSocieties } = useUserRoles();
  const { setActiveSocietyId } = useLocalAppState();

  const [societyId, setSocietyId] = useState<string | null>(
    route.params?.societyId ?? (adminSocieties.length === 1 ? adminSocieties[0].societyId : null),
  );

  const chosen = adminSocieties.find((s) => s.societyId === societyId) ?? null;

  const go = (screen: 'CreatePost' | 'CreateEvent' | 'CreatePoll') => {
    if (!societyId) return;
    setActiveSocietyId(societyId);
    navigation.navigate(screen, { societyId });
  };

  if (adminSocieties.length === 0) {
    return (
      <ScreenLayout scroll={false}>
        <TopNavBar title="Create" onBack={() => navigation.goBack()} />
        <EmptyState
          icon="lock-outline"
          title="Committee access needed"
          subtitle="Only society committee members can post updates, events, and polls."
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <TopNavBar title="Create" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScreenHeader title="What are you sharing?" subtitle="Choose a society, then a format." gutter={false} />

        <Text style={[theme.typography.micro, styles.label, { color: theme.colors.textSecondary }]}>POSTING AS</Text>
        <View style={{ gap: spacing.sm }}>
          {adminSocieties.map((s) => {
            const selected = s.societyId === societyId;
            return (
              <Card
                key={s.societyId}
                onPress={() => setSocietyId(s.societyId)}
                style={selected ? { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft } : undefined}
              >
                <View style={styles.societyRow}>
                  <Avatar name={s.societyName} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{s.societyName}</Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{s.role}</Text>
                  </View>
                  {selected ? (
                    <View style={[styles.check, { backgroundColor: theme.colors.primary }]} />
                  ) : (
                    <View style={[styles.check, { borderWidth: 2, borderColor: theme.colors.borderStrong }]} />
                  )}
                </View>
              </Card>
            );
          })}
        </View>

        <Text style={[theme.typography.micro, styles.label, { color: theme.colors.textSecondary }]}>FORMAT</Text>
        <View style={{ gap: spacing.sm, opacity: chosen ? 1 : 0.5 }} pointerEvents={chosen ? 'auto' : 'none'}>
          <Card padding={0}>
            <ListRow title="Post an update" subtitle="Announcements & news" leading={<FormatIcon name="campaign" />} chevron onPress={() => go('CreatePost')} />
          </Card>
          <Card padding={0}>
            <ListRow title="Create an event" subtitle="Date, location, RSVPs" leading={<FormatIcon name="event" />} chevron onPress={() => go('CreateEvent')} />
          </Card>
          <Card padding={0}>
            <ListRow title="Run a poll" subtitle="Ask your members" leading={<FormatIcon name="how-to-vote" />} chevron onPress={() => go('CreatePoll')} />
          </Card>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  label: { marginTop: spacing.lg, marginBottom: spacing.xs },
  societyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { width: 22, height: 22, borderRadius: 11 },
  formatIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
