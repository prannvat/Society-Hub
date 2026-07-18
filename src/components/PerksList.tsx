import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card } from '@/components/Card';
import { BadgeChip } from '@/components/BadgeChip';
import { SocietyPerk } from '@/types';

type PerksListProps = {
  perks: SocietyPerk[];
  /** Members see perks as unlocked; non-members see them as a join incentive. */
  isMember: boolean;
};

export const PerksList = ({ perks, isMember }: PerksListProps) => {
  const theme = useAppTheme();

  if (perks.length === 0) {
    return null;
  }

  return (
    <Card padding={0}>
      {perks.map((perk, index) => (
        <View key={perk.id}>
          {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.colors.border }]} /> : null}
          <View style={styles.row}>
            <View
              style={[
                styles.iconSquare,
                { backgroundColor: isMember ? theme.colors.primarySoft : theme.colors.surfaceSunken }
              ]}
            >
              <MaterialIcons
                name={isMember ? 'card-giftcard' : 'lock'}
                size={20}
                color={isMember ? theme.colors.primary : theme.colors.textTertiary}
              />
            </View>
            <View style={styles.textWrap}>
              <Text
                style={[theme.typography.bodyMedium, { color: isMember ? theme.colors.textPrimary : theme.colors.textSecondary }]}
                numberOfLines={1}
              >
                {perk.title}
              </Text>
              {perk.description ? (
                <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]} numberOfLines={2}>
                  {perk.description}
                </Text>
              ) : null}
            </View>
            {isMember ? (
              <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
            ) : (
              <BadgeChip label="Join to unlock" variant="neutral" />
            )}
          </View>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrap: {
    flex: 1,
    gap: 2
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68
  }
});
