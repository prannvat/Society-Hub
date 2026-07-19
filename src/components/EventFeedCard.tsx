import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FeedPostShell } from './FeedPostShell';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { ContentOwnerMenu } from './ContentOwnerMenu';
import { FeedSociety } from '@/hooks/useFeed';
import { EventItem } from '@/types';
import { haptics } from '@/utils/haptics';
import { useAppTheme } from '@/hooks/useAppTheme';

type EventFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  event: EventItem;
  isGoing: boolean;
  onOpenSociety: () => void;
  onOpenDetail: () => void;
  onToggleRSVP: () => Promise<void>;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const parseEventDate = (event: EventItem): Date | null => {
  if (event.startAtIso) {
    const parsed = new Date(event.startAtIso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  const fallback = new Date(event.date);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const EventFeedCard = ({
  society,
  createdAtIso,
  event,
  isGoing,
  onOpenSociety,
  onOpenDetail,
  onToggleRSVP,
  canManage = false,
  onEdit,
  onDelete
}: EventFeedCardProps) => {
  const theme = useAppTheme();
  const [optimisticGoing, setOptimisticGoing] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const going = optimisticGoing ?? isGoing;
  const eventDate = parseEventDate(event);
  const hasPoster = typeof event.posterImageUrl === 'string' && /^https?:\/\//i.test(event.posterImageUrl);

  const handleRSVP = async () => {
    if (busy) {
      return;
    }
    const next = !going;
    if (next) {
      haptics.success();
    } else {
      haptics.tap();
    }
    setOptimisticGoing(next);
    setBusy(true);
    try {
      await onToggleRSVP();
    } catch {
      setOptimisticGoing(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FeedPostShell onPress={onOpenDetail}>
      <FeedCardHeader
        society={society}
        createdAtIso={createdAtIso}
        onPressSociety={onOpenSociety}
        trailing={
          <View style={styles.headerTrailing}>
            <BadgeChip label={event.isFree ? 'Free' : 'Paid'} variant={event.isFree ? 'success' : 'neutral'} />
            <ContentOwnerMenu
              noun="event"
              visible={canManage && Boolean(onDelete)}
              onEdit={onEdit}
              onDelete={() => onDelete?.()}
            />
          </View>
        }
      />

      {/* Edge-to-edge hero, Instagram-style: the poster when there is one,
          otherwise a dark block with a calendar motif so every event still
          carries visual weight in the feed. */}
      {hasPoster ? (
        <Image
          source={{ uri: event.posterImageUrl }}
          style={[styles.hero, { backgroundColor: theme.colors.surfaceSunken }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.hero, styles.heroFallback]}>
          <MaterialIcons name="event" size={44} color="rgba(255,255,255,0.9)" />
        </View>
      )}

      {/* Caption: bold title then a single meta line (date · time · location). */}
      <Text style={[theme.typography.bodyMedium, styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {event.title}
      </Text>
      <Text style={[theme.typography.caption, styles.meta, { color: theme.colors.textSecondary }]} numberOfLines={1}>
        {[
          eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : null,
          event.time,
          event.location
        ]
          .filter(Boolean)
          .join('  ·  ')}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.metaRow}>
          <MaterialIcons name="people-outline" size={16} color={theme.colors.textTertiary} />
          <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
            {event.attendingCount} going
          </Text>
        </View>

        <Pressable
          onPress={handleRSVP}
          disabled={busy}
          hitSlop={6}
          style={({ pressed }) => [
            styles.rsvpButton,
            {
              borderRadius: theme.radius.pill,
              backgroundColor: going ? theme.colors.successSoft : theme.colors.primary,
              opacity: pressed && !busy ? 0.85 : 1,
              transform: [{ scale: pressed && !busy ? 0.98 : 1 }]
            }
          ]}
        >
          <MaterialIcons
            name={going ? 'check-circle' : 'add'}
            size={16}
            color={going ? theme.colors.success : theme.colors.textOnPrimary}
          />
          <Text
            style={[
              theme.typography.captionMedium,
              { color: going ? theme.colors.success : theme.colors.textOnPrimary, fontSize: 13 }
            ]}
          >
            {going ? 'Going' : 'RSVP'}
          </Text>
        </Pressable>
      </View>
    </FeedPostShell>
  );
};

const styles = StyleSheet.create({
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  // Cancel the shell's 16px horizontal padding so the hero is edge-to-edge.
  hero: {
    height: 260,
    marginTop: 12,
    marginHorizontal: -16
  },
  heroFallback: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    marginTop: 12
  },
  meta: {
    marginTop: 2
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    minWidth: 96,
    justifyContent: 'center',
    paddingHorizontal: 18
  }
});
