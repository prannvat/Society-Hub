import { apiRequest } from './client';
import { PollItem } from './types';

export async function fetchPolls(societyId: string) {
  return apiRequest<PollItem[]>(`/polls?societyId=${encodeURIComponent(societyId)}`);
}

export async function createPoll(input: {
  societyId: string;
  question: string;
  options: string[];
}) {
  return apiRequest<{ id: string }>('/polls', {
    method: 'POST',
    body: input,
  });
}

export async function voteOnPoll(pollId: string, optionId: string) {
  return apiRequest<{ id: string }>(`/polls/${pollId}/vote`, {
    method: 'POST',
    body: { optionId },
  });
}
