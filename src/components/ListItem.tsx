import React, { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type ListItemProps = {
  label: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
};

export const ListItem = ({ label, left, right, onPress }: ListItemProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.colors.border,
          opacity: pressed && onPress && Platform.OS === 'ios' ? 0.7 : 1,
          backgroundColor: pressed && onPress ? theme.colors.surfaceSunken : 'transparent'
        }
      ]}
    >
      <View style={styles.leftWrap}>
        {left}
        <Text
          style={[theme.typography.body, { color: theme.colors.textPrimary, flexShrink: 1 }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
      {right}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  leftWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 12
  }
});
