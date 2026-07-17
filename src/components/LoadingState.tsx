import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export const LoadingState = () => {
  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Skeleton width="42%" height={16} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="88%" height={14} />
      <Skeleton width="64%" height={14} />
    </View>
  );
};
