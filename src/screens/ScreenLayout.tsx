import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type ScreenLayoutProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
};

export const ScreenLayout = ({ children, scroll = true, padded = false }: ScreenLayoutProps) => {
  const theme = useAppTheme();
  const padding = padded ? { paddingHorizontal: spacing.lg } : null;

  const content = !scroll ? (
    <View style={[styles.innerNoScroll, padding]}>{children}</View>
  ) : (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, padding]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {content}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
  },
  innerNoScroll: {
    flex: 1,
  }
});
