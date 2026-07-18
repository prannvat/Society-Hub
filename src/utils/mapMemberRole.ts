import { SocietyRole } from '@/services/api/types';
import { MemberRole } from '@/types';

/** API (UPPERCASE) → UI (Title-case) society role. Single source of truth. */
export const mapMemberRole = (role: SocietyRole | string): MemberRole => {
  switch (role) {
    case 'PRESIDENT':
      return 'President';
    case 'COMMITTEE':
      return 'Committee';
    default:
      return 'Member';
  }
};

/** UI (Title-case) → API (UPPERCASE) society role. */
export const mapMemberRoleToApi = (role: MemberRole): SocietyRole => {
  switch (role) {
    case 'President':
      return 'PRESIDENT';
    case 'Committee':
      return 'COMMITTEE';
    default:
      return 'MEMBER';
  }
};
