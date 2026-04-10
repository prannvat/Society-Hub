import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
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
      {items.map((item) => (
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
              backgroundColor: activeChip === item ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed && Platform.OS === 'ios' ? 0.85 : 1
            }
          ]}
        >
          <Text style={{ color: activeChip === item ? theme.colors.background : theme.colors.textPrimary, fontWeight: '600' }} numberOfLines={1}>{item}</Text>
        </Pressable>
      ))}
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
    borderRadius: 100,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
