import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useToast } from '@/components/Toast';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { ScreenLayout } from './ScreenLayout';

// Self-contained animation exception: the result bar eases to its percentage width.
const PollResultBar = ({ percent }: { percent: number }) => {
  const theme = useAppTheme();
  const width = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    Animated.timing(width, { toValue: percent, duration: 350, useNativeDriver: false }).start();
  }, [percent, width]);

  return (
    <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceSunken }]}>
      <Animated.View
        style={[
          styles.barFill,
          {
            backgroundColor: theme.colors.primary,
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })
          }
        ]}
      />
    </View>
  );
};

export const SocietyPollsScreen = () => {
  const theme = useAppTheme();
  const toast = useToast();
  const { activeSocietyId, activeSocietyRole, polls, createPoll, voteOnPoll } = useLocalAppState();
  const [showComposer, setShowComposer] = React.useState(false);
  const [draftQuestion, setDraftQuestion] = React.useState('');
  const [draftOptions, setDraftOptions] = React.useState(['', '', '']);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [showValidation, setShowValidation] = React.useState(false);

  const canCreatePolls = activeSocietyRole === 'President' || activeSocietyRole === 'Committee';
  const activePolls = polls.filter((poll) => poll.societyId === activeSocietyId);
  const normalizedOptions = draftOptions.map((option) => option.trim()).filter(Boolean);
  const hasDuplicateOptions = new Set(normalizedOptions.map((option) => option.toLowerCase())).size !== normalizedOptions.length;
  const pollValidationError = !draftQuestion.trim()
    ? 'Enter a poll question.'
    : normalizedOptions.length < 2
      ? 'Add at least two options.'
      : hasDuplicateOptions
        ? 'Each option must be unique.'
        : '';

  const publishPoll = async () => {
    if (pollValidationError) {
      setShowValidation(true);
      return;
    }

    setIsPublishing(true);
    try {
      const newPollId = await createPoll({
        societyId: activeSocietyId,
        question: draftQuestion,
        options: draftOptions
      });

      if (newPollId) {
        setDraftQuestion('');
        setDraftOptions(['', '', '']);
        setShowComposer(false);
        setShowValidation(false);
        toast.show('Poll published — it is now live for all members', 'success');
        return;
      }

      toast.show('Unable to publish. Review your question and options, then try again.', 'error');
    } catch {
      toast.show('We could not publish this poll right now.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await voteOnPoll(pollId, optionId);
    } catch {
      toast.show('Unable to submit your vote right now.', 'error');
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.page}>
        <TopNavBar
          title="Polls"
          subtitle={`${activePolls.length} active poll${activePolls.length === 1 ? '' : 's'} • ${activeSocietyRole} access`}
        />

        {/* Create-poll entry — mirrors the announcements composer */}
        {canCreatePolls && !showComposer ? (
          <Card onPress={() => setShowComposer(true)}>
            <View style={styles.composerEntry}>
              <View style={[styles.composerIcon, { backgroundColor: theme.colors.primarySoft }]}>
                <MaterialIcons name="poll" size={18} color={theme.colors.primary} />
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.textTertiary, flex: 1 }]}>
                Ask the society something…
              </Text>
            </View>
          </Card>
        ) : null}

        {canCreatePolls && showComposer ? (
          <Card>
            <View style={styles.composerForm}>
              <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Create a poll</Text>
              <InputField
                label="Question"
                placeholder="Ask the society something"
                value={draftQuestion}
                onChangeText={setDraftQuestion}
                error={showValidation && !draftQuestion.trim() ? 'Enter a poll question.' : undefined}
              />
              {draftOptions.map((option, index) => (
                <InputField
                  key={`draft-option-${index}`}
                  label={`Option ${index + 1}`}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChangeText={(value) => {
                    setDraftOptions((prev) => prev.map((entry, optionIndex) => (optionIndex === index ? value : entry)));
                  }}
                />
              ))}
              {showValidation && pollValidationError && draftQuestion.trim() ? (
                <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{pollValidationError}</Text>
              ) : null}
              <View style={styles.composerActions}>
                <PrimaryButton
                  label="Cancel"
                  variant="ghost"
                  size="md"
                  disabled={isPublishing}
                  onPress={() => setShowComposer(false)}
                />
                <View style={styles.composerPublish}>
                  <PrimaryButton label="Publish poll" size="md" loading={isPublishing} onPress={publishPoll} />
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        {!canCreatePolls && activePolls.length > 0 ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
            Everyone can vote. Poll creation is available to Committee and Presidents.
          </Text>
        ) : null}

        {activePolls.length > 0 ? (
          activePolls.map((poll) => {
            const totalVotes = Object.keys(poll.responses).length;
            const myVote = poll.responses.m3;

            return (
              <Card key={poll.id}>
                <View style={styles.pollBody}>
                  <View style={styles.pollHeader}>
                    <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{poll.question}</Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                      {poll.createdBy} • {poll.createdAt}
                    </Text>
                  </View>

                  <View style={styles.optionList}>
                    {poll.options.map((option) => {
                      const votes = Object.values(poll.responses).filter((response) => response === option.id).length;
                      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const selected = myVote === option.id;

                      return (
                        <Pressable
                          key={option.id}
                          onPress={() => handleVote(poll.id, option.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Vote for ${option.label}`}
                          style={({ pressed }) => [
                            styles.optionRow,
                            {
                              borderRadius: theme.radius.card,
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                              backgroundColor: selected
                                ? theme.colors.primarySoft
                                : pressed
                                  ? theme.colors.surfaceSunken
                                  : theme.colors.surface,
                              transform: [{ scale: pressed ? 0.99 : 1 }]
                            }
                          ]}
                        >
                          <View style={styles.optionTopRow}>
                            {selected ? (
                              <MaterialIcons name="check-circle" size={18} color={theme.colors.primary} />
                            ) : (
                              <MaterialIcons name="radio-button-unchecked" size={18} color={theme.colors.textTertiary} />
                            )}
                            <Text
                              style={[
                                theme.typography.bodyMedium,
                                { color: selected ? theme.colors.primary : theme.colors.textPrimary, flex: 1 }
                              ]}
                              numberOfLines={2}
                            >
                              {option.label}
                            </Text>
                            <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                              {percent}%
                            </Text>
                          </View>
                          <PollResultBar percent={percent} />
                          <Text style={[theme.typography.caption, styles.voteCount, { color: theme.colors.textTertiary }]}>
                            {votes} vote{votes === 1 ? '' : 's'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.pollFooter}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textTertiary }]}>
                      {totalVotes} live vote{totalVotes === 1 ? '' : 's'}
                    </Text>
                    {myVote ? (
                      <View style={styles.votedTag}>
                        <MaterialIcons name="check" size={14} color={theme.colors.success} />
                        <Text style={[theme.typography.captionMedium, { color: theme.colors.success }]}>You voted</Text>
                      </View>
                    ) : (
                      <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>Tap to vote</Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="poll"
            title="No polls yet"
            subtitle={
              canCreatePolls
                ? 'Publish the first poll and results will update live for the whole society.'
                : 'Committee members can publish the first poll here.'
            }
            actionLabel={canCreatePolls ? 'Create a poll' : undefined}
            onAction={canCreatePolls ? () => setShowComposer(true) : undefined}
          />
        )}
        {!canCreatePolls && activePolls.length === 0 ? (
          <View style={styles.roleNote}>
            <BadgeChip label={`${activeSocietyRole} access`} variant="neutral" />
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16
  },
  composerEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 32
  },
  composerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  },
  composerForm: {
    gap: 12
  },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10
  },
  composerPublish: {
    minWidth: 140
  },
  pollBody: {
    gap: 14
  },
  pollHeader: {
    gap: 4
  },
  optionList: {
    gap: 10
  },
  optionRow: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    gap: 8
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 999
  },
  voteCount: {
    fontSize: 11,
    lineHeight: 14
  },
  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  votedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  roleNote: {
    alignItems: 'center'
  }
});
