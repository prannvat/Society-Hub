import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type InputFieldProps = {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
};

export const InputField = ({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType = 'default',
  error,
  icon,
  autoCapitalize,
  multiline = false
}: InputFieldProps) => {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const [textHidden, setTextHidden] = useState(true);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            borderColor,
            borderRadius: theme.radius.input,
            backgroundColor: focused ? theme.colors.primarySoft : theme.colors.surface,
            minHeight: multiline ? 96 : 52
          }
        ]}
      >
        {icon ? (
          <MaterialIcons
            name={icon}
            size={20}
            color={focused ? theme.colors.primary : theme.colors.textTertiary}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? (keyboardType === 'email-address' ? 'none' : undefined)}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry ? textHidden : false}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingVertical: multiline ? 12 : 0
            }
          ]}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setTextHidden((prev: boolean) => !prev)} hitSlop={10}>
            <MaterialIcons
              name={textHidden ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14
  },
  input: {
    flex: 1,
    fontSize: 15,
    includeFontPadding: false
  }
});
