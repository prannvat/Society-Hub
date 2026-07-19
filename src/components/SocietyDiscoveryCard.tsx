import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { BadgeChip } from './BadgeChip';
import { PrimaryButton } from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { SocietyItem } from '@/types';

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** A society is "New" when it was created within the last ~14 days. */
export const isNewSociety = (createdAt?: string): boolean => {
  if (!createdAt) {
    return false;
  }
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return false;
  }
  const age = Date.now() - created;
  return age >= 0 && age <= NEW_WINDOW_MS;
};

export const societyMemberCount = (society: SocietyItem): number =>
  society._count?.memberships ?? society.memberCount ?? 0;

type SocietyDiscoveryCardProps = {
  society: SocietyItem;
  isMember: boolean;
  isPending: boolean;
  isJoining: boolean;
  /** Whether this society ranks among the campus's most popular right now. */
  trending?: boolean;
  onJoin: () => void;
  onPress: () => void;
};

export const SocietyDiscoveryCard = ({
  society,
  isMember,
  isPending,
  isJoining,
  trending = false,
  onJoin,
  onPress
}: SocietyDiscoveryCardProps) => {
  const theme = useAppTheme();
  const members = societyMemberCount(society);
  const isNew = !trending && isNewSociety(society.createdAt);

  return (
    <Card padding={0} onPress={onPress} style={styles.card}>
      <View style={styles.body}>
        <View style={styles.topRow}>
          {society.logoUrl ? (
            <Image
              source={{ uri: society.logoUrl }}
              style={[styles.logo, { borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceSunken }]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.logo, { borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceSunken }]}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {society.shortName}
              </Text>
            </View>
          )}
          <View style={styles.chiplets}>
            {trending ? (
              <View style={[styles.chiplet, { backgroundColor: theme.colors.surfaceSunken }]}>
                <Text style={[theme.typography.micro, { color: theme.colors.textSecondary }]}>Trending</Text>
              </View>
            ) : null}
            {isNew ? (
              <View style={[styles.chiplet, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>New</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: 12 }]} numberOfLines={1}>
          {society.name}
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4, minHeight: 36 }]}
          numberOfLines={2}
        >
          {society.description || 'Official university society.'}
        </Text>

        <View style={styles.metaRow}>
          <MaterialIcons name="groups" size={14} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            {members} {members === 1 ? 'member' : 'members'}
          </Text>
        </View>

        <View style={styles.spacer} />

        {isPending ? (
          <BadgeChip label="Pending" variant="warning" style={styles.statusChip} />
        ) : isMember ? (
          <BadgeChip label="Joined" variant="success" style={styles.statusChip} />
        ) : (
          <PrimaryButton label="Join" size="sm" loading={isJoining} onPress={onJoin} style={styles.joinButton} />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 214,
    overflow: 'hidden'
  },
  body: {
    flex: 1,
    padding: 14
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  logo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chiplets: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 1
  },
  chiplet: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8
  },
  spacer: {
    flex: 1,
    minHeight: 10
  },
  statusChip: {
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  joinButton: {
    alignSelf: 'stretch'
  }
});
