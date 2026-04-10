import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AnnouncementItem } from '@/types';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type AnnouncementCardProps = {
  item: AnnouncementItem;
  onPress?: (item: AnnouncementItem) => void;
};

export const AnnouncementCard = ({ item, onPress }: AnnouncementCardProps) => {
  const theme = useAppTheme();

  return (
    <Pressable onPress={() => onPress?.(item)}>
      <Card>
        <View style={{ gap: 6 }}>
          <View style={styles.row}>
            <Text
              style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1, paddingRight: 8 }}
              numberOfLines={1}
            >
              {item.category}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{item.timestamp}</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>{item.title}</Text>
          <Text numberOfLines={2} style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>{item.preview}</Text>
          <Text style={{ marginTop: 8, color: theme.colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
            {item.authorName}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  }
});
