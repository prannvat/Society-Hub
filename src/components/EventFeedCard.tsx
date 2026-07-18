import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FeedPostShell } from './FeedPostShell';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { FeedSociety } from '@/hooks/useFeed';
import { EventItem } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

type EventFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  event: EventItem;
  isGoing: boolean;
  onOpenSociety: () => void;
  onOpenDetail: () => void;
  onToggleRSVP: () => Promise<void>;
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
  onToggleRSVP
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
        trailing={<BadgeChip label={event.isFree ? 'Free' : 'Paid'} variant={event.isFree ? 'success' : 'neutral'} />}
      />

      {hasPoster ? (
        <Image
          source={{ uri: event.posterImageUrl }}
          style={[styles.poster, { borderRadius: theme.radius.card, backgroundColor: theme.colors.surfaceSunken }]}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.mainRow}>
        <View style={[styles.dateBlock, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.card }]}>
          {eventDate ? (
            <>
              <Text style={[theme.typography.h2, { color: theme.colors.primary }]}>{eventDate.getDate()}</Text>
              <Text style={[theme.typography.micro, { color: theme.colors.primary }]}>
                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </>
          ) : (
            <MaterialIcons name="event" size={24} color={theme.colors.primary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={14} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 1 }]} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="schedule" size={14} color={theme.colors.textTertiary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {event.time}
            </Text>
          </View>
        </View>
      </View>

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
  poster: {
    width: '100%',
    height: 150,
    marginTop: 12
  },
  mainRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 14
  },
  dateBlock: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  info: {
    flex: 1,
    gap: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  footerRow: {
    marginTop: 14,
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
