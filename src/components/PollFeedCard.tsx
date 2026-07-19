import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FeedPostShell } from './FeedPostShell';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { ContentOwnerMenu } from './ContentOwnerMenu';
import { FeedPoll, FeedSociety } from '@/hooks/useFeed';
import { useAppTheme } from '@/hooks/useAppTheme';
import { haptics } from '@/utils/haptics';

type PollFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  poll: FeedPoll;
  onOpenSociety: () => void;
  onVote: (optionId: string) => Promise<void>;
  canManage?: boolean;
  onDelete?: () => void;
};

type DisplayOption = {
  id: string;
  label: string;
  count: number;
  percentage: number;
};

type ResultRowProps = {
  option: DisplayOption;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
};

const ResultRow = ({ option, selected, onPress, disabled }: ResultRowProps) => {
  const theme = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(100, option.percentage));

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 440, useNativeDriver: false }).start();
  }, [anim, pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct}%`] });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.resultRow,
        {
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.surfaceSunken,
          borderColor: selected ? theme.colors.primary : 'transparent',
          opacity: pressed ? 0.9 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.resultFill,
          { width, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceElevated }
        ]}
      />
      <View style={styles.resultContent}>
        <View style={styles.resultLabelWrap}>
          {selected ? <MaterialIcons name="check-circle" size={16} color={theme.colors.primary} /> : null}
          <Text
            style={[
              theme.typography.bodyMedium,
              { color: selected ? theme.colors.primary : theme.colors.textPrimary, flexShrink: 1 }
            ]}
            numberOfLines={1}
          >
            {option.label}
          </Text>
        </View>
        <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>{pct}%</Text>
      </View>
    </Pressable>
  );
};

export const PollFeedCard = ({ society, createdAtIso, poll, onOpenSociety, onVote, canManage = false, onDelete }: PollFeedCardProps) => {
  const theme = useAppTheme();
  const [optimisticVote, setOptimisticVote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const serverVote = poll.currentUserVote;
  const selectedOptionId = optimisticVote ?? serverVote;
  const hasVoted = selectedOptionId != null;

  // Project tallies locally for an unconfirmed vote — whether it's a first vote
  // or a change from a previous option — so results update immediately.
  const { options, totalVotes } = useMemo<{ options: DisplayOption[]; totalVotes: number }>(() => {
    if (optimisticVote == null || optimisticVote === serverVote) {
      return { options: poll.options, totalVotes: poll.totalVotes };
    }
    const isNewVote = serverVote == null;
    const total = isNewVote ? poll.totalVotes + 1 : poll.totalVotes;
    const options = poll.options.map((option) => {
      let count = option.count;
      if (option.id === optimisticVote) count += 1; // gained the vote
      if (option.id === serverVote) count -= 1; // moved away from the old option
      count = Math.max(0, count);
      return { id: option.id, label: option.label, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
    return { options, totalVotes: total };
  }, [poll, optimisticVote, serverVote]);

  const handleVote = async (optionId: string) => {
    // Allow changing the vote; only ignore taps on the current option or while busy.
    if (busy || optionId === selectedOptionId) {
      return;
    }
    const previous = optimisticVote;
    haptics.select();
    setOptimisticVote(optionId);
    setBusy(true);
    try {
      await onVote(optionId);
    } catch {
      setOptimisticVote(previous);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FeedPostShell>
      <FeedCardHeader
        society={society}
        createdAtIso={createdAtIso}
        onPressSociety={onOpenSociety}
        trailing={
          <View style={styles.headerTrailing}>
            <BadgeChip label="Poll" variant="primary" />
            {/* Delete only — a poll's options are immutable once votes exist. */}
            <ContentOwnerMenu
              noun="poll"
              visible={canManage && Boolean(onDelete)}
              onDelete={() => onDelete?.()}
            />
          </View>
        }
      />

      <Text style={[theme.typography.h3, styles.question, { color: theme.colors.textPrimary }]}>{poll.question}</Text>

      <View style={styles.options}>
        {hasVoted
          ? options.map((option) => (
              <ResultRow
                key={option.id}
                option={option}
                selected={option.id === selectedOptionId}
                onPress={() => handleVote(option.id)}
                disabled={busy}
              />
            ))
          : options.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleVote(option.id)}
                disabled={busy}
                style={({ pressed }) => [
                  styles.voteRow,
                  {
                    borderRadius: theme.radius.card,
                    backgroundColor: theme.colors.surfaceSunken,
                    borderColor: theme.colors.border,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }]
                  }
                ]}
              >
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
      </View>

      <Text style={[theme.typography.caption, styles.tally, { color: theme.colors.textTertiary }]}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        {hasVoted ? ' · Tap another option to change your vote' : ' · Tap an option to vote'}
      </Text>
    </FeedPostShell>
  );
};

const styles = StyleSheet.create({
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  question: {
    marginTop: 12
  },
  options: {
    marginTop: 12,
    gap: 8
  },
  voteRow: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1
  },
  resultRow: {
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5
  },
  resultFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14
  },
  resultLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1
  },
  tally: {
    marginTop: 12
  }
});
