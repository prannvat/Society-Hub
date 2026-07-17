import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

export type ToastType = 'success' | 'error' | 'info';

type ToastState = { message: string; type: ToastType } | null;

type ToastContextValue = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const AUTO_DISMISS_MS = 2500;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const theme = useAppTheme();
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      setToast({ message, type });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
      }, AUTO_DISMISS_MS);
    },
    [opacity]
  );

  const value = useMemo(() => ({ show }), [show]);

  const accentColor =
    toast?.type === 'success' ? theme.colors.success : toast?.type === 'error' ? theme.colors.danger : theme.colors.primary;
  const iconName: keyof typeof MaterialIcons.glyphMap =
    toast?.type === 'success' ? 'check-circle' : toast?.type === 'error' ? 'error-outline' : 'info-outline';

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={styles.host}>
          <Animated.View
            style={[
              styles.pill,
              theme.elevation.e3,
              {
                opacity,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.colors.border
              }
            ]}
          >
            <MaterialIcons name={iconName} size={18} color={accentColor} />
            <Text style={[theme.typography.captionMedium, { color: theme.colors.textPrimary, flexShrink: 1 }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '86%',
    paddingHorizontal: 16,
    paddingVertical: 12
  }
});
