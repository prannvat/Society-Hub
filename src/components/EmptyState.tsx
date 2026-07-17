import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PrimaryButton } from './PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

type EmptyStateProps = {
  title: string;
  subtitle: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ title, subtitle, icon, actionLabel, onAction }: EmptyStateProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      {icon ? (
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primarySoft }]}>
          <MaterialIcons name={icon} size={28} color={theme.colors.primary} />
        </View>
      ) : null}
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, textAlign: 'center' }]}>{title}</Text>
      <Text style={[theme.typography.caption, styles.subtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
      {actionLabel ? (
        <PrimaryButton label={actionLabel} onPress={onAction} size="md" variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    padding: 24,
    alignItems: 'center'
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280
  },
  action: {
    marginTop: 16
  }
});
