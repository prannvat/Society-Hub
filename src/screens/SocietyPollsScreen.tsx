import React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { BadgeChip } from '@/components/BadgeChip';
import { Card } from '@/components/Card';
import { OutlineButton } from '@/components/OutlineButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TopNavBar } from '@/components/TopNavBar';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalAppState } from '@/hooks/useLocalAppState';
import { ScreenLayout } from './ScreenLayout';

export const SocietyPollsScreen = () => {
  const theme = useAppTheme();
  const { activeSocietyId, activeSocietyRole, polls, createPoll, voteOnPoll } = useLocalAppState();
  const [showComposer, setShowComposer] = React.useState(false);
  const [draftQuestion, setDraftQuestion] = React.useState('');
  const [draftOptions, setDraftOptions] = React.useState(['', '', '']);

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
      Alert.alert('Cannot Publish Poll', pollValidationError);
      return;
    }

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
        Alert.alert('Poll Published', 'Your poll is now live for all members.');
        return;
      }

      Alert.alert('Unable to Publish', 'Please review your question and options, then try again.');
    } catch {
      Alert.alert('Unable to Publish', 'We could not publish this poll right now.');
    }
  };

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 }}>
        <TopNavBar
          title="Polls"
          subtitle={activeSocietyRole === 'President' ? 'President access' : activeSocietyRole === 'Committee' ? 'Committee access' : 'Member access'}
          actionLabel={canCreatePolls ? (showComposer ? 'Hide' : 'New Poll') : undefined}
          onPressAction={() => setShowComposer((prev) => !prev)}
        />

        <Card>
          <View style={{ gap: 8 }}>
            <BadgeChip label={`${activeSocietyRole} access`} variant="outlined" />
            <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: '800' }}>Live society polls</Text>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
              Committee members can publish polls, everyone can vote, and results update instantly for the whole society.
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {activePolls.length} active poll{activePolls.length === 1 ? '' : 's'}
            </Text>
          </View>
        </Card>

        {!canCreatePolls ? (
          <Card>
            <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
              You can vote on all polls. Poll creation is available to Committee and Presidents only.
            </Text>
          </Card>
        ) : null}

        {canCreatePolls && showComposer ? (
          <Card>
            <View style={{ gap: 12 }}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' }}>Create a poll</Text>
              <TextInput
                value={draftQuestion}
                onChangeText={setDraftQuestion}
                placeholder="Ask the society something"
                placeholderTextColor={theme.colors.textSecondary}
                style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
              />
              {draftOptions.map((option, index) => (
                <TextInput
                  key={`draft-option-${index}`}
                  value={option}
                  onChangeText={(value) => {
                    setDraftOptions((prev) => prev.map((entry, optionIndex) => (optionIndex === index ? value : entry)));
                  }}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.textSecondary}
                  style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.textPrimary }}
                />
              ))}
              {pollValidationError ? (
                <Text style={{ color: theme.colors.error, fontSize: 12 }}>{pollValidationError}</Text>
              ) : null}
              <View style={{ gap: 8 }}>
                <PrimaryButton label="Publish Poll" onPress={publishPoll} />
                <OutlineButton label="Cancel" onPress={() => setShowComposer(false)} />
              </View>
            </View>
          </Card>
        ) : null}

        {activePolls.length > 0 ? (
          activePolls.map((poll) => {
            const totalVotes = Object.keys(poll.responses).length;
            const myVote = poll.responses.m3;

            return (
              <Card key={poll.id}>
                <View style={{ gap: 14 }}>
                  <View style={{ gap: 4 }}>
                    <Text style={{ color: theme.colors.textPrimary, fontSize: 17, fontWeight: '800' }}>{poll.question}</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{poll.createdBy} • {poll.createdAt}</Text>
                  </View>

                  <View style={{ gap: 10 }}>
                    {poll.options.map((option) => {
                      const votes = Object.values(poll.responses).filter((response) => response === option.id).length;
                      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const selected = myVote === option.id;

                      return (
                        <Pressable key={option.id} onPress={async () => {
                          try {
                            await voteOnPoll(poll.id, option.id);
                          } catch {
                            Alert.alert('Vote Failed', 'Unable to submit vote right now.');
                          }
                        }} style={{ gap: 8 }}>
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                              backgroundColor: selected ? `${theme.colors.primary}10` : theme.colors.surface,
                              borderRadius: 14,
                              paddingHorizontal: 14,
                              paddingVertical: 12,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <Text style={{ color: theme.colors.textPrimary, fontWeight: '700', flex: 1 }}>{option.label}</Text>
                            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{votes} vote{votes === 1 ? '' : 's'} • {percent}%</Text>
                          </View>
                          <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.colors.border, overflow: 'hidden' }}>
                            <View style={{ width: `${Math.max(percent, selected ? 4 : 0)}%`, height: '100%', backgroundColor: theme.colors.primary }} />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{totalVotes} live vote{totalVotes === 1 ? '' : 's'}</Text>
                    <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>{myVote ? 'Your vote is live' : 'Tap to vote'}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <Card>
            <Text style={{ color: theme.colors.textSecondary }}>No polls yet. Committee members can publish the first one here.</Text>
          </Card>
        )}
      </View>
    </ScreenLayout>
  );
};