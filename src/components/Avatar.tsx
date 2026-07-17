import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type AvatarProps = {
  name: string;
  online?: boolean;
  size?: number;
  url?: string;
};

// 8 pleasant hues; light mode uses saturated bgs with white text,
// dark mode uses lifted bgs with a dark ink for contrast.
const AVATAR_PALETTE: { light: string; dark: string }[] = [
  { light: '#4F46E5', dark: '#818CF8' }, // indigo
  { light: '#0D9488', dark: '#2DD4BF' }, // teal
  { light: '#D97706', dark: '#FBBF24' }, // amber
  { light: '#DB2777', dark: '#F472B6' }, // pink
  { light: '#7C3AED', dark: '#A78BFA' }, // violet
  { light: '#059669', dark: '#34D399' }, // emerald
  { light: '#0284C7', dark: '#38BDF8' }, // sky
  { light: '#E11D48', dark: '#FB7185' }  // rose
];

const hashName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return hash;
};

export const Avatar = ({ name, online, size = 44, url }: AvatarProps) => {
  const theme = useAppTheme();
  const isDark = theme.mode === 'dark';

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const hue = AVATAR_PALETTE[hashName(name || '?') % AVATAR_PALETTE.length];
  const backgroundColor = isDark ? hue.dark : hue.light;
  const textColor = isDark ? '#14163A' : '#FFFFFF';

  return (
    <View>
      {url ? (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceSunken }}
        />
      ) : (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
          <Text style={[styles.text, { color: textColor, fontSize: Math.max(11, Math.round(size * 0.36)) }]}>
            {initials}
          </Text>
        </View>
      )}
      {online ? (
        <View style={[styles.dot, { backgroundColor: theme.colors.success, borderColor: theme.colors.background }]} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '700',
    includeFontPadding: false
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    right: 0,
    bottom: 2,
    borderWidth: 2
  }
});
