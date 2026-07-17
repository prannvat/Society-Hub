import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MemberItem, MemberRole } from '@/types';
import { Avatar } from './Avatar';
import { BadgeChip, BadgeChipVariant } from './BadgeChip';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type MemberCardProps = {
  member: MemberItem;
  onPressProfile?: (member: MemberItem) => void;
};

const roleChipVariant: Record<MemberRole, BadgeChipVariant> = {
  President: 'primary',
  Committee: 'warning',
  Member: 'neutral'
};

export const MemberCard = ({ member, onPressProfile }: MemberCardProps) => {
  const theme = useAppTheme();
  const isVerified = member.universityBadge === 'Verified';

  return (
    <Card onPress={onPressProfile ? () => onPressProfile(member) : undefined}>
      <View style={styles.row}>
        <Avatar name={member.name} online={member.online} size={48} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text
              style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]}
              numberOfLines={1}
            >
              {member.name}
            </Text>
            {isVerified ? <MaterialIcons name="verified" size={16} color={theme.colors.primary} /> : null}
          </View>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {member.year}
          </Text>
        </View>
        <BadgeChip label={member.role} variant={roleChipVariant[member.role]} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  info: {
    flex: 1,
    gap: 2
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  }
});
