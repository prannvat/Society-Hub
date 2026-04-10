import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
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
        { borderBottomColor: theme.colors.border, opacity: pressed && onPress && Platform.OS === 'ios' ? 0.7 : 1 }
      ]}
    >
      <View style={styles.leftWrap}>
        {left}
        <Text style={{ color: theme.colors.textPrimary, flexShrink: 1 }} numberOfLines={2}>{label}</Text>
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
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1
  },
  leftWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12
  }
});
