import { EventItem as ApiEventItem } from '@/services/api/types';
import { EventItem } from '@/types';

/** Maps an API event to the app's EventItem shape. Single source of truth. */
export const mapApiEvent = (event: ApiEventItem): EventItem => {
  const start = new Date(event.startAt);
  return {
    id: event.id,
    societyId: event.societyId,
    title: event.title,
    description: event.description,
    date: start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    startAtIso: event.startAt,
    endAtIso: event.endAt ?? null,
    location: event.location,
    locationPlaceId: event.locationPlaceId ?? undefined,
    locationLatitude: event.locationLatitude ?? undefined,
    locationLongitude: event.locationLongitude ?? undefined,
    posterImageUrl: event.posterImageUrl ?? undefined,
    isFree: event.isFree,
    membersOnly: event.membersOnly,
    attendingCount: event._count?.rsvps ?? 0,
    isRsvpedByCurrentUser: Boolean(event.isRsvpedByCurrentUser),
  };
};
