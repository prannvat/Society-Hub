import { ApiAnnouncementCategory } from '@/services/api/announcements';
import { AnnouncementCategory } from '@/types';

/** API (UPPERCASE) → UI (Title-case) announcement category. Single source of truth. */
export const mapAnnouncementCategory = (category: ApiAnnouncementCategory): AnnouncementCategory => {
  switch (category) {
    case 'EVENTS':
      return 'Events';
    case 'IMPORTANT':
      return 'Important';
    case 'COMMITTEE':
      return 'Committee';
    default:
      return 'General';
  }
};

/** UI (Title-case) → API (UPPERCASE) announcement category. */
export const mapAnnouncementCategoryToApi = (category: AnnouncementCategory): ApiAnnouncementCategory => {
  switch (category) {
    case 'Events':
      return 'EVENTS';
    case 'Important':
      return 'IMPORTANT';
    case 'Committee':
      return 'COMMITTEE';
    default:
      return 'GENERAL';
  }
};
