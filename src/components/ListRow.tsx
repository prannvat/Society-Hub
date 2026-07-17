import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ListRow = ({ title, subtitle, leading, trailing, chevron = false, onPress, style }: ListRowProps) => {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? theme.colors.surfaceSunken : 'transparent' },
        style
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textWrap}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron ? <MaterialIcons name="chevron-right" size={22} color={theme.colors.textTertiary} /> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  leading: {
    flexShrink: 0
  },
  textWrap: {
    flex: 1,
    gap: 2
  }
});
