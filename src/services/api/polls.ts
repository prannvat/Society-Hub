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

/**
 * Edit a poll's question. Options are intentionally immutable — changing them
 * after voting would reassign votes already cast.
 */
export async function updatePoll(pollId: string, question: string) {
  return apiRequest(`/polls/${encodeURIComponent(pollId)}`, {
    method: 'PATCH',
    body: { question },
  });
}

/** Delete a poll, along with its options and votes. */
export async function deletePoll(pollId: string) {
  return apiRequest<{ success: true }>(`/polls/${encodeURIComponent(pollId)}`, {
    method: 'DELETE',
  });
}
