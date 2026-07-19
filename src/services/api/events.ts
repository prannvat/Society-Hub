import { apiRequest } from './client';
import { EventItem } from './types';

export async function fetchEvents(societyId: string) {
  return apiRequest<EventItem[]>(`/events?societyId=${encodeURIComponent(societyId)}`);
}

export async function createEvent(input: {
  societyId: string;
  title: string;
  description: string;
  location: string;
  locationPlaceId?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  posterImageUrl?: string;
  startAt: string;
  endAt?: string;
  membersOnly: boolean;
  isFree: boolean;
}) {
  return apiRequest<EventItem>('/events', {
    method: 'POST',
    body: input,
  });
}

export async function rsvpToEvent(eventId: string) {
  return apiRequest<{ id: string }>(`/events/${eventId}/rsvp`, {
    method: 'POST',
  });
}

export async function removeRsvpFromEvent(eventId: string) {
  return apiRequest<{ success: boolean; removed?: boolean }>(`/events/${eventId}/rsvp`, {
    method: 'DELETE',
  });
}

/** Edit an event. Committee/president of the owning society only. */
export async function updateEvent(
  eventId: string,
  input: {
    title?: string;
    description?: string;
    location?: string;
    locationPlaceId?: string;
    locationLatitude?: number;
    locationLongitude?: number;
    posterImageUrl?: string | null;
    startAt?: string;
    endAt?: string | null;
    membersOnly?: boolean;
    isFree?: boolean;
  },
) {
  return apiRequest(`/events/${encodeURIComponent(eventId)}`, { method: 'PATCH', body: input });
}

/** Delete an event, along with its RSVPs. */
export async function deleteEvent(eventId: string) {
  return apiRequest<{ success: true }>(`/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
  });
}
