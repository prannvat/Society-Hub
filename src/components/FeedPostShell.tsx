import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type FeedPostShellProps = {
  children: ReactNode;
  onPress?: () => void;
};

/**
 * The Instagram post frame every feed card sits in: full-bleed, no border or
 * radius, separated from the next post by a single hairline. Replaces the old
 * floating Card — posts stack edge to edge like a real feed.
 */
export const FeedPostShell = ({ children, onPress }: FeedPostShellProps) => {
  const theme = useAppTheme();
  const base = [
    styles.shell,
    { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...base, { opacity: pressed ? 0.7 : 1 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
};

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
