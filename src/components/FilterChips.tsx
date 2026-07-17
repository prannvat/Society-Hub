import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type FilterChipsProps = {
  items: string[];
  onChange?: (selected: string) => void;
};

export const FilterChips = ({ items, onChange }: FilterChipsProps) => {
  const theme = useAppTheme();
  const [activeChip, setActiveChip] = React.useState(items[0]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {items.map((item) => {
        const selected = activeChip === item;
        return (
          <Pressable
            key={item}
            android_ripple={{ color: 'rgba(0,0,0,0.08)', borderless: false }}
            onPress={() => {
              setActiveChip(item);
              onChange?.(item);
            }}
            hitSlop={4}
            style={({ pressed }) => [
              styles.chip,
              {
                borderRadius: theme.radius.pill,
                backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }]
              }
            ]}
          >
            <Text
              style={[
                theme.typography.captionMedium,
                { color: selected ? theme.colors.textOnPrimary : theme.colors.textSecondary, fontSize: 14 }
              ]}
              numberOfLines={1}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4
  },
  chip: {
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
