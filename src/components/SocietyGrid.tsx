import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useAppTheme } from '@/hooks/useAppTheme';
import { SocietyRole } from '@/services/api/types';

/** One tile in the grid. Kept structural so both API and local shapes can feed it. */
export type SocietyGridItem = {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  /** Drives the corner badge. Omit or use MEMBER for no badge. */
  role?: SocietyRole;
  /** Renders a muted "Pending" treatment instead of a role badge. */
  pending?: boolean;
};

type SocietyGridProps = {
  societies: SocietyGridItem[];
  onPressSociety: (societyId: string) => void;
  /** Shown in place of the grid when the list is empty. */
  emptyTitle: string;
  emptySubtitle: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  loading?: boolean;
};

const COLUMNS = 3;
const GAP = 8;
const SKELETON_TILES = 6;

const ROLE_BADGE: Partial<Record<SocietyRole, string>> = {
  PRESIDENT: 'President',
  COMMITTEE: 'Committee',
};

/** A safe hex fallback so a malformed brand colour can never crash the gradient. */
const safeColor = (value: string | undefined, fallback: string): string =>
  typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
    ? value.trim()
    : fallback;

const initialsFor = (item: SocietyGridItem): string => {
  const source = item.shortName?.trim() || item.name?.trim() || '?';
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return source.slice(0, 3).toUpperCase();
};

/**
 * The 3-column grid of square society cards — a profile's visual anchor, the
 * analogue of Instagram's photo grid. Each tile wears the society's own brand
 * gradient so a profile reads as a collage of the communities someone is in.
 */
export const SocietyGrid = ({
  societies,
  onPressSociety,
  emptyTitle,
  emptySubtitle,
  emptyActionLabel,
  onEmptyAction,
  loading = false,
}: SocietyGridProps) => {
  const theme = useAppTheme();

  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: SKELETON_TILES }).map((_, index) => (
          <View key={index} style={styles.cell}>
            {/* absoluteFill lets the square wrapper drive the size, not Skeleton's height prop. */}
            <View style={styles.skeletonWrap}>
              <Skeleton radius={theme.radius.lg} style={StyleSheet.absoluteFill} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (societies.length === 0) {
    return (
      <EmptyState
        icon="grid-view"
        title={emptyTitle}
        subtitle={emptySubtitle}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <View style={styles.grid}>
      {societies.map((society) => {
        const primary = safeColor(society.primaryColor, theme.colors.primary);
        const secondary = safeColor(society.secondaryColor, theme.colors.accent);
        const badge = society.pending ? 'Pending' : society.role ? ROLE_BADGE[society.role] : undefined;

        return (
          <View key={society.id} style={styles.cell}>
            <Pressable
              onPress={() => onPressSociety(society.id)}
              accessibilityRole="button"
              accessibilityLabel={`${society.name}${badge ? `, ${badge}` : ''}`}
              style={({ pressed }) => [
                styles.tile,
                {
                  borderRadius: theme.radius.lg,
                  opacity: pressed ? 0.85 : society.pending ? 0.6 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <LinearGradient
                colors={[primary, secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fill}
              >
                {society.logoUrl ? (
                  <Image source={{ uri: society.logoUrl }} style={styles.logo} resizeMode="cover" />
                ) : (
                  <View style={styles.initialsWrap}>
                    <Text style={styles.initials} numberOfLines={1}>
                      {initialsFor(society)}
                    </Text>
                  </View>
                )}

                {/* Scrim keeps the short name legible over any logo or brand colour. */}
                <View style={styles.scrim} />

                <View style={styles.caption}>
                  <Text style={styles.captionText} numberOfLines={1}>
                    {society.shortName || society.name}
                  </Text>
                </View>

                {badge ? (
                  <View style={[styles.badge, { borderRadius: theme.radius.pill }]}>
                    {society.pending ? null : (
                      <MaterialIcons
                        name={society.role === 'PRESIDENT' ? 'star' : 'shield'}
                        size={10}
                        color="#FFFFFF"
                      />
                    )}
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {badge}
                    </Text>
                  </View>
                ) : null}
              </LinearGradient>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Percentage widths and `gap` don't compose in RN (3 x 33.33% + gaps overflows),
  // so the gutter comes from per-cell padding cancelled by a negative grid margin.
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -GAP / 2,
  },
  cell: {
    width: `${100 / COLUMNS}%`,
    padding: GAP / 2,
  },
  tile: {
    aspectRatio: 1,
    overflow: 'hidden',
  },
  skeletonWrap: {
    aspectRatio: 1,
    width: '100%',
  },
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  initialsWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    top: '55%',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  caption: {
    paddingHorizontal: 8,
    paddingBottom: 7,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
