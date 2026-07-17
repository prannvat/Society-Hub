import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
};

export const SearchBar = ({ value, onChangeText, placeholder = 'Search members...' }: SearchBarProps) => {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: theme.radius.pill,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.surface
        }
      ]}
    >
      <MaterialIcons name="search" size={20} color={focused ? theme.colors.primary : theme.colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { color: theme.colors.textPrimary }]}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    minHeight: 46,
    paddingHorizontal: 14
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    includeFontPadding: false
  }
});
