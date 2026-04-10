import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MemberItem } from '@/types';
import { Avatar } from './Avatar';
import { BadgeChip } from './BadgeChip';
import { Card } from './Card';
import { useAppTheme } from '@/hooks/useAppTheme';

type MemberCardProps = {
  member: MemberItem;
  onPressProfile?: (member: MemberItem) => void;
};

export const MemberCard = ({ member, onPressProfile }: MemberCardProps) => {
  const theme = useAppTheme();

  return (
    <Pressable onPress={() => onPressProfile?.(member)}>
      <Card>
        <View style={styles.content}>
        <Avatar name={member.name} online={member.online} />
        <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{member.name}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{member.year}</Text>
        <View style={{ marginTop: 8 }}>
          <BadgeChip label={member.role} variant={member.role === 'Member' ? 'outlined' : 'filled'} />
        </View>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 10, fontSize: 12 }}>Tap to view profile</Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center'
  },
  name: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700'
  }
});
