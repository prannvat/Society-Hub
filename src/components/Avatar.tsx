import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import { fonts } from '@/config/theme';

type AvatarProps = {
  name: string;
  online?: boolean;
  size?: number;
  url?: string;
};

export const Avatar = ({ name, online, size = 44, url }: AvatarProps) => {
  const theme = useAppTheme();

  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  // One neutral treatment for every placeholder — a soft grey fill with ink
  // initials, like Instagram. No per-name hues; colour was the loudest source
  // of visual noise in the feed.
  return (
    <View>
      {url ? (
        <Image
          source={{ uri: url }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceSunken }}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.colors.surfaceSunken,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: theme.colors.border
            }
          ]}
        >
          <Text style={[styles.text, { color: theme.colors.textSecondary, fontSize: Math.max(11, Math.round(size * 0.36)) }]}>
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
    fontFamily: fonts.sansSemibold,
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
