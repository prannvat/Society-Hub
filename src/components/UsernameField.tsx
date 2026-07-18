import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { useAppTheme } from '@/hooks/useAppTheme';
import { checkUsernameAvailable, validateUsername } from '@/services/api/users';

export type UsernameStatus = 'empty' | 'invalid' | 'checking' | 'available' | 'taken' | 'unknown';

type UsernameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  /** Lets the parent block saving while the handle is invalid or taken. */
  onStatusChange?: (status: UsernameStatus) => void;
};

const DEBOUNCE_MS = 500;

/**
 * The @handle field. Mirrors the backend's rules locally so an invalid handle
 * explains itself instantly, and debounces a real availability check for the
 * rest. The caller's own current handle reports as available server-side, so an
 * untouched form never false-conflicts.
 */
export const UsernameField = ({ value, onChangeText, onStatusChange }: UsernameFieldProps) => {
  const theme = useAppTheme();
  const [status, setStatus] = useState<UsernameStatus>('empty');

  const trimmed = value.trim().toLowerCase();
  const formatError = validateUsername(trimmed);

  useEffect(() => {
    if (trimmed.length === 0) {
      setStatus('empty');
      return;
    }
    if (formatError) {
      setStatus('invalid');
      return;
    }

    setStatus('checking');
    let cancelled = false;
    const timer = setTimeout(() => {
      checkUsernameAvailable(trimmed)
        .then((result) => {
          if (cancelled) return;
          setStatus(result.available ? 'available' : 'taken');
        })
        .catch(() => {
          if (cancelled) return;
          // Network hiccup — don't block the user; let the save call be the judge.
          setStatus('unknown');
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, formatError]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const hint = (() => {
    switch (status) {
      case 'checking':
        return { icon: null, color: theme.colors.textTertiary, text: 'Checking availability…' };
      case 'available':
        return { icon: 'check-circle' as const, color: theme.colors.success, text: `@${trimmed} is available` };
      case 'taken':
        return { icon: 'cancel' as const, color: theme.colors.danger, text: 'That username is already taken' };
      case 'invalid':
        return { icon: 'error-outline' as const, color: theme.colors.danger, text: formatError ?? 'Invalid username' };
      case 'unknown':
        return { icon: 'cloud-off' as const, color: theme.colors.textTertiary, text: "Couldn't check right now" };
      default:
        return {
          icon: null,
          color: theme.colors.textTertiary,
          text: '3–20 characters. Letters, numbers, dots and underscores.',
        };
    }
  })();

  return (
    <View style={styles.wrap}>
      <InputField
        label="Username"
        placeholder="yourhandle"
        value={value}
        // Normalise as they type so what they see is what gets stored.
        onChangeText={(next) => onChangeText(next.trim().toLowerCase())}
        icon="alternate-email"
        autoCapitalize="none"
      />
      <View style={styles.hintRow}>
        {status === 'checking' ? (
          <ActivityIndicator size="small" color={theme.colors.textTertiary} />
        ) : hint.icon ? (
          <MaterialIcons name={hint.icon} size={14} color={hint.color} />
        ) : null}
        <Text style={[theme.typography.caption, { color: hint.color, flex: 1 }]}>{hint.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 18,
    paddingHorizontal: 2,
  },
});
