import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
};

export const SearchBar = ({ value, onChangeText, placeholder = 'Search members...' }: SearchBarProps) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}> 
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        style={{ color: theme.colors.textPrimary, minHeight: 24, paddingVertical: 0 }}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 100,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center'
  }
});
