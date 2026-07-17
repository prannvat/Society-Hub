import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { BadgeChip } from './BadgeChip';
import { FeedCardHeader } from './FeedCardHeader';
import { FeedPoll, FeedSociety } from '@/hooks/useFeed';
import { useAppTheme } from '@/hooks/useAppTheme';

type PollFeedCardProps = {
  society: FeedSociety;
  createdAtIso: string;
  poll: FeedPoll;
  onOpenSociety: () => void;
  onVote: (optionId: string) => Promise<void>;
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
};

const ResultRow = ({ option, selected }: ResultRowProps) => {
  const theme = useAppTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(100, option.percentage));

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 440, useNativeDriver: false }).start();
  }, [anim, pct]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct}%`] });

  return (
    <View
      style={[
        styles.resultRow,
        {
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.surfaceSunken,
          borderColor: selected ? theme.colors.primary : 'transparent'
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
    </View>
  );
};

export const PollFeedCard = ({ society, createdAtIso, poll, onOpenSociety, onVote }: PollFeedCardProps) => {
  const theme = useAppTheme();
  const [optimisticVote, setOptimisticVote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedOptionId = optimisticVote ?? poll.currentUserVote;
  const hasVoted = selectedOptionId != null;

  // When we have an optimistic vote the server hasn't confirmed yet, project the
  // new tallies locally so results animate in immediately.
  const { options, totalVotes } = useMemo<{ options: DisplayOption[]; totalVotes: number }>(() => {
    const projecting = optimisticVote != null && poll.currentUserVote == null;
    if (!projecting) {
      return { options: poll.options, totalVotes: poll.totalVotes };
    }
    const total = poll.totalVotes + 1;
    const options = poll.options.map((option) => {
      const count = option.count + (option.id === optimisticVote ? 1 : 0);
      return { id: option.id, label: option.label, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
    return { options, totalVotes: total };
  }, [poll, optimisticVote]);

  const handleVote = async (optionId: string) => {
    if (busy || hasVoted) {
      return;
    }
    setOptimisticVote(optionId);
    setBusy(true);
    try {
      await onVote(optionId);
    } catch {
      setOptimisticVote(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <FeedCardHeader
        society={society}
        createdAtIso={createdAtIso}
        onPressSociety={onOpenSociety}
        trailing={<BadgeChip label="Poll" variant="primary" />}
      />

      <Text style={[theme.typography.h3, styles.question, { color: theme.colors.textPrimary }]}>{poll.question}</Text>

      <View style={styles.options}>
        {hasVoted
          ? options.map((option) => (
              <ResultRow key={option.id} option={option} selected={option.id === selectedOptionId} />
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
        {hasVoted ? '' : ' · Tap an option to vote'}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
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
