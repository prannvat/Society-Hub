import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TopNavBar } from '@/components/TopNavBar';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { useUserRoles } from '@/hooks/useUserRoles';
import { RootStackParamList } from '@/navigation/types';
import { ScreenLayout } from './ScreenLayout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Format = {
  screen: 'CreatePost' | 'CreateEvent' | 'CreatePoll';
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
};

const FORMATS: Format[] = [
  { screen: 'CreatePost', icon: 'campaign', title: 'Post an update', description: 'Share announcements & news' },
  { screen: 'CreateEvent', icon: 'event', title: 'Create an event', description: 'Date, location & RSVPs' },
  { screen: 'CreatePoll', icon: 'how-to-vote', title: 'Run a poll', description: 'Ask your members a question' },
];

/**
 * Global "＋ Create" sheet for committee members: pick which society you're posting
 * as, then choose Post / Event / Poll. No mode switch — creation is contextual.
 */
export const CreateHubScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateHub'>>();
  const { adminSocieties, rolesStatus, refreshUserRoles } = useUserRoles();
  const { setActiveSocietyId } = useLocalAppState();

  const [societyId, setSocietyId] = useState<string | null>(
    route.params?.societyId ?? (adminSocieties.length === 1 ? adminSocieties[0].societyId : null),
  );

  const chosen = adminSocieties.find((s) => s.societyId === societyId) ?? null;
  const single = adminSocieties.length === 1;

  const go = (screen: Format['screen']) => {
    if (!societyId) return;
    setActiveSocietyId(societyId);
    navigation.navigate(screen, { societyId });
  };

  // Only claim the user lacks access once roles have actually loaded — while
  // loading or after a failed fetch, saying "committee access needed" to a real
  // committee member is a lie they can't act on.
  if (adminSocieties.length === 0 && rolesStatus !== 'ready') {
    return (
      <ScreenLayout scroll={false}>
        <TopNavBar title="Create" onBack={() => navigation.goBack()} />
        {rolesStatus === 'loading' ? (
          <Skeleton height={120} />
        ) : (
          <EmptyState
            icon="cloud-off"
            title="Couldn't check your access"
            subtitle="We couldn't reach the server to confirm your committee roles."
            actionLabel="Try again"
            onAction={refreshUserRoles}
          />
        )}
      </ScreenLayout>
    );
  }

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
        {single && chosen ? (
          // Only one admin society — de-emphasize the picker into a read-only context row.
          <Card>
            <View style={styles.societyRow}>
              <Avatar name={chosen.societyName} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {chosen.societyName}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{chosen.role}</Text>
              </View>
              <MaterialIcons name="check-circle" size={22} color={theme.colors.primary} />
            </View>
          </Card>
        ) : (
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
                      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                        {s.societyName}
                      </Text>
                      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{s.role}</Text>
                    </View>
                    {selected ? (
                      <MaterialIcons name="check-circle" size={22} color={theme.colors.primary} />
                    ) : (
                      <View style={[styles.check, { borderWidth: 2, borderColor: theme.colors.borderStrong }]} />
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <Text style={[theme.typography.micro, styles.label, { color: theme.colors.textSecondary }]}>FORMAT</Text>
        <View style={{ gap: spacing.sm, opacity: chosen ? 1 : 0.45 }} pointerEvents={chosen ? 'auto' : 'none'}>
          {FORMATS.map((format) => (
            <Card key={format.screen} onPress={() => go(format.screen)}>
              <View style={styles.formatRow}>
                <View style={[styles.formatIcon, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.card }]}>
                  <MaterialIcons name={format.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]}>{format.title}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{format.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} />
              </View>
            </Card>
          ))}
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
  formatRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  formatIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
