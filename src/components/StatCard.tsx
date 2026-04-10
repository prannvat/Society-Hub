import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type StatCardProps = {
  label: string;
  value: string | number;
};

export const StatCard = ({ label, value }: StatCardProps) => {
  const theme = useAppTheme();

  return (
    <Card>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  value: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800'
  }
});
