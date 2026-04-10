import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

export const LoadingState = () => {
  const theme = useAppTheme();
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
};
