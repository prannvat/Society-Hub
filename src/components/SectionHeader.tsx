import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type SectionHeaderProps = {
  title: string;
  rightText?: string;
  onPressRight?: () => void;
};

export const SectionHeader = ({ title, rightText, onPressRight }: SectionHeaderProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.colors.textPrimary, flex: 1, paddingRight: 8 }]} numberOfLines={1}>{title}</Text>
      {rightText ? (
        <Pressable onPress={onPressRight} hitSlop={6}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{rightText}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  }
});
