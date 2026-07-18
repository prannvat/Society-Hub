import { apiRequest } from './client';
import { SocietyPerk } from './types';

/** Member perks a society offers. Part of the rewards incentive layer. */
export async function fetchSocietyPerks(societyId: string) {
  return apiRequest<SocietyPerk[]>(`/societies/${encodeURIComponent(societyId)}/perks`);
}

export async function addSocietyPerk(societyId: string, input: { title: string; description: string }) {
  return apiRequest<SocietyPerk>(`/societies/${encodeURIComponent(societyId)}/perks`, {
    method: 'POST',
    body: input,
  });
}

export async function removeSocietyPerk(societyId: string, perkId: string) {
  return apiRequest<{ success: boolean }>(
    `/societies/${encodeURIComponent(societyId)}/perks/${encodeURIComponent(perkId)}`,
    { method: 'DELETE' },
  );
}
