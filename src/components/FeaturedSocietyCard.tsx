import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import { SocietyItem } from '@/types';
import { societyMemberCount } from './SocietyDiscoveryCard';

// A deliberate premium dark tile (fixed in both modes, like a featured card on
// Spotify/IG). White ink on near-black — striking without any brand colour.
const CARD_BG = '#121212';
const GLASS_SOFT = 'rgba(255, 255, 255, 0.10)';
const GLASS_STRONG = 'rgba(255, 255, 255, 0.16)';
const INK = '#FFFFFF';
const INK_SOFT = 'rgba(255, 255, 255, 0.72)';

type FeaturedSocietyCardProps = {
  society: SocietyItem;
  isMember: boolean;
  isPending: boolean;
  isJoining: boolean;
  onJoin: () => void;
  onPress: () => void;
};

export const FeaturedSocietyCard = ({
  society,
  isMember,
  isPending,
  isJoining,
  onJoin,
  onPress
}: FeaturedSocietyCardProps) => {
  const theme = useAppTheme();
  const members = societyMemberCount(society);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${society.name}, featured society`}
      style={({ pressed }) => [
        styles.pressable,
        theme.elevation.e2,
        { borderRadius: theme.radius.lg, transform: [{ scale: pressed ? 0.99 : 1 }], opacity: pressed ? 0.96 : 1 }
      ]}
    >
      <View style={[styles.gradient, { backgroundColor: CARD_BG, borderRadius: theme.radius.lg }]}>
        <View style={styles.headerRow}>
          {society.logoUrl ? (
            <Image source={{ uri: society.logoUrl }} style={styles.logo} resizeMode="cover" />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={[theme.typography.captionMedium, { color: INK }]} numberOfLines={1}>
                {society.shortName}
              </Text>
            </View>
          )}
          <View style={styles.featuredChip}>
            <MaterialIcons name="star" size={13} color={INK} />
            <Text style={[theme.typography.micro, { color: INK }]}>Featured</Text>
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={[theme.typography.h2, styles.name, { color: INK }]} numberOfLines={2}>
            {society.name}
          </Text>
          <Text style={[theme.typography.caption, { color: INK_SOFT, marginTop: 4 }]} numberOfLines={2}>
            {society.description || 'Official university society.'}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.metaRow}>
            <MaterialIcons name="groups" size={15} color={INK_SOFT} />
            <Text style={[theme.typography.captionMedium, { color: INK }]}>
              {members} {members === 1 ? 'member' : 'members'}
            </Text>
          </View>

          {isPending ? (
            <View style={[styles.statusPill, { backgroundColor: GLASS_STRONG }]}>
              <Text style={[theme.typography.captionMedium, { color: INK, fontSize: 12 }]}>Pending</Text>
            </View>
          ) : isMember ? (
            <View style={[styles.statusPill, { backgroundColor: GLASS_STRONG }]}>
              <MaterialIcons name="check" size={14} color={INK} />
              <Text style={[theme.typography.captionMedium, { color: INK, fontSize: 12 }]}>Joined</Text>
            </View>
          ) : (
            <Pressable
              onPress={onJoin}
              disabled={isJoining}
              accessibilityRole="button"
              accessibilityLabel={`Join ${society.name}`}
              style={({ pressed }) => [
                styles.joinPill,
                { backgroundColor: INK, opacity: isJoining ? 0.7 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }
              ]}
            >
              <Text style={[theme.typography.captionMedium, { color: CARD_BG, fontSize: 13 }]}>
                {isJoining ? 'Joining…' : 'Join'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%'
  },
  gradient: {
    minHeight: 196,
    padding: 16,
    justifyContent: 'space-between'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: GLASS_SOFT
  },
  logoFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  featuredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: GLASS_STRONG
  },
  textBlock: {
    marginTop: 14
  },
  name: {
    fontSize: 20,
    lineHeight: 25
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    borderRadius: 100,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  joinPill: {
    minHeight: 44,
    minWidth: 84,
    borderRadius: 100,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
