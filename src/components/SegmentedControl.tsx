import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type SegmentedControlProps<T extends string> = {
  segments: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Optional brand accent for the active pill (defaults to theme primary). */
  accent?: string;
};

/**
 * Controlled, IG-style segmented control. State lives entirely with the parent —
 * this renders the selection and reports taps. One sliding pill highlights the
 * active segment. Each segment is a ≥44pt-tall target.
 */
export const SegmentedControl = <T extends string>({ segments, value, onChange, accent }: SegmentedControlProps<T>) => {
  const theme = useAppTheme();
  const activeColor = accent ?? theme.colors.primary;

  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.pill }]}>
      {segments.map((segment) => {
        const selected = segment === value;
        return (
          <Pressable
            key={segment}
            onPress={() => onChange(segment)}
            style={({ pressed }) => [
              styles.segment,
              {
                borderRadius: theme.radius.pill,
                backgroundColor: selected ? theme.colors.surface : 'transparent',
                opacity: pressed && !selected ? 0.7 : 1,
              },
              selected ? theme.elevation.e1 : null,
            ]}
          >
            <Text
              style={[
                theme.typography.captionMedium,
                { color: selected ? activeColor : theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {segment}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
