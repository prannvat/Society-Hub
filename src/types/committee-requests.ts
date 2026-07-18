import { MemberRole } from './index';

// A student's request for a committee/president role in a society.
// Students raise these in the app; the students' union reviews them in the
// separate web portal — the mobile app is read-only past submission.

export type CommitteeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type CommitteeRequest = {
  id: string;
  userId: string;
  societyId: string;
  requestedRole: MemberRole; // Committee or President
  currentRole: MemberRole;
  status: CommitteeRequestStatus;
  justification?: string;
  supportingEvidence?: string[];
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerComments?: string;
  expiresAt: string;

  // Populated data
  user?: {
    id: string;
    fullName: string;
    email: string;
    university: string;
    course?: string;
    year?: string;
    avatarUrl?: string;
  };
  society?: {
    id: string;
    name: string;
    shortName: string;
    university: string;
  };
};

export type CreateCommitteeRequestInput = {
  societyId: string;
  requestedRole: MemberRole;
  justification: string;
  supportingEvidence?: string[];
};
