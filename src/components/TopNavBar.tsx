import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type TopNavBarProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onBack?: () => void;
  /** Self-applies the standard screen gutter. Turn off when a parent already pads horizontally. */
  gutter?: boolean;
};

export const TopNavBar = ({ title, subtitle, actionLabel, onPressAction, onBack, gutter = true }: TopNavBarProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.row, gutter ? { paddingHorizontal: spacing.lg } : null, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.leftWrap}>
        {onBack && (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            {({ pressed }) => (
              <MaterialIcons
                name="chevron-left"
                size={30}
                color={theme.colors.textPrimary}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text
              style={[theme.typography.h3, { color: theme.colors.textPrimary, flexShrink: 1 }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
          {subtitle ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {actionLabel ? (
        <Pressable
          onPress={onPressAction}
          android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
          style={({ pressed }) => [
            styles.actionPill,
            {
              borderRadius: theme.radius.pill,
              borderColor: pressed ? theme.colors.primary : theme.colors.borderStrong,
              backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface,
              opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1
            }
          ]}
        >
          <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]} numberOfLines={1}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 56,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  leftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12
  },
  back: {
    marginRight: 6,
    marginLeft: -6
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionPill: {
    maxWidth: '45%',
    minHeight: 40,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
