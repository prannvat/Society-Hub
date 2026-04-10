import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/hooks/useAppTheme';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
};

export const GlassCard = ({ children, style, intensity = 80 }: GlassCardProps) => {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';
  
  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint={isDark ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill} 
      />
      <View style={[
        styles.inner, 
        { 
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
          backgroundColor: isDark ? 'rgba(20, 20, 20, 0.4)' : 'rgba(255, 255, 255, 0.6)'
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  inner: {
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
  }
});
