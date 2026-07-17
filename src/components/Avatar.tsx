import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

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

  return (
    <View>
      {url ? (
        <Image 
          source={{ uri: url }} 
          style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.border }]} 
        />
      ) : (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.primary }]}> 
          <Text style={[styles.text, { color: '#FFF' }]}>{initials}</Text>
        </View>
      )}
      {online ? <View style={[styles.dot, { backgroundColor: theme.colors.success, borderColor: theme.colors.background }]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '700'
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
