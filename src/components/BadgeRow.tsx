import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { CampusBadge } from '@/utils/campusPoints';

type BadgeRowProps = {
  badges: CampusBadge[];
  onPressBadge?: (badge: CampusBadge) => void;
};

/**
 * Campus reward badges rendered as medallions — earned ones are filled with the
 * brand gradient, unearned ones are muted with a hint surfaced on press.
 */
export const BadgeRow = ({ badges, onPressBadge }: BadgeRowProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      {badges.map((badge) => {
        const iconName = badge.icon as keyof typeof MaterialIcons.glyphMap;
        return (
          <Pressable
            key={badge.id}
            onPress={onPressBadge ? () => onPressBadge(badge) : undefined}
            disabled={!onPressBadge}
            hitSlop={6}
            accessibilityRole={onPressBadge ? 'button' : undefined}
            accessibilityLabel={
              badge.earned ? `${badge.label} badge, earned` : `${badge.label} badge, locked. ${badge.hint}`
            }
            style={({ pressed }) => [styles.item, { opacity: pressed && onPressBadge ? 0.65 : 1 }]}
          >
            {badge.earned ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.medallion}
              >
                <MaterialIcons name={iconName} size={22} color={theme.colors.textOnPrimary} />
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.medallion,
                  { backgroundColor: theme.colors.surfaceSunken, borderWidth: 1, borderColor: theme.colors.border }
                ]}
              >
                <MaterialIcons name={iconName} size={20} color={theme.colors.textTertiary} />
              </View>
            )}
            <Text
              numberOfLines={1}
              style={[
                theme.typography.caption,
                {
                  color: badge.earned ? theme.colors.textPrimary : theme.colors.textTertiary,
                  fontWeight: badge.earned ? '600' : '400',
                  marginTop: 6
                }
              ]}
            >
              {badge.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14
  },
  item: {
    width: 56,
    alignItems: 'center'
  },
  medallion: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
