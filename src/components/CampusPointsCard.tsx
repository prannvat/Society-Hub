import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Card } from '@/components/Card';
import { CampusProgress } from '@/utils/campusPoints';

type CampusPointsCardProps = {
  progress: CampusProgress;
};

/**
 * The student's rewards headline: total Campus Points (derived deterministically
 * from real activity), current level, and progress toward the next level.
 */
export const CampusPointsCard = ({ progress }: CampusPointsCardProps) => {
  const theme = useAppTheme();
  const { points, levelTitle, intoLevel, levelSpan, pointsToNextLevel } = progress;

  const ratio = levelSpan > 0 ? Math.max(0, Math.min(1, intoLevel / levelSpan)) : 0;
  const atTop = pointsToNextLevel <= 0;

  return (
    <Card padding={18}>
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.medal}
        >
          <MaterialIcons name="military-tech" size={22} color={theme.colors.textOnPrimary} />
        </LinearGradient>
        <View style={styles.headerText}>
          <Text style={[theme.typography.micro, { color: theme.colors.textTertiary }]}>Campus points</Text>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {levelTitle}
          </Text>
        </View>
        <View style={[styles.levelChip, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill }]}>
          <MaterialIcons name="stars" size={13} color={theme.colors.primary} />
          <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>{`Lvl ${progress.level}`}</Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>{points}</Text>
        <Text style={[theme.typography.captionMedium, { color: theme.colors.textTertiary }]}>pts</Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.colors.surfaceSunken }]}>
        {ratio > 0 ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: ratio }}
          />
        ) : null}
        {ratio < 1 ? <View style={{ flex: 1 - ratio }} /> : null}
      </View>

      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
        {atTop ? 'Top level reached — you’re a campus legend' : `${pointsToNextLevel} pts to the next level`}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  medal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    flex: 1,
    gap: 2
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 14
  },
  track: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10
  }
});
