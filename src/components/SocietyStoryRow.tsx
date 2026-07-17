import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { FeedSociety } from '@/hooks/useFeed';
import { spacing } from '@/config/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type SocietyStoryRowProps = {
  societies: FeedSociety[];
  onPressSociety: (societyId: string) => void;
};

/** Instagram-style horizontal rail of the societies the user has joined. */
export const SocietyStoryRow = ({ societies, onPressSociety }: SocietyStoryRowProps) => {
  const theme = useAppTheme();

  if (societies.length === 0) {
    return null;
  }

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={societies}
      keyExtractor={(society) => society.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPressSociety(item.id)}
          style={({ pressed }) => [styles.story, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={[styles.ring, { borderColor: item.primaryColor, backgroundColor: theme.colors.surface }]}>
            <Avatar name={item.name} url={item.logoUrl ?? undefined} size={58} />
          </View>
          <Text style={[theme.typography.caption, styles.label, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.shortName || item.name}
          </Text>
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md
  },
  story: {
    alignItems: 'center',
    gap: 6,
    width: 72
  },
  ring: {
    padding: 2.5,
    borderWidth: 2,
    borderRadius: 40
  },
  label: {
    maxWidth: 72,
    textAlign: 'center'
  }
});
