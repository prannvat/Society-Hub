import { MemberRole } from './index';

// Union Admin Role Types
export type UnionRole = 'UnionAdmin' | 'UnionModerator';

export type UnionAdminRelationship = {
  universityId: string;
  universityName: string;
  role: UnionRole;
  permissions: UnionPermission[];
  canManageAllSocieties: boolean;
  canApproveCommitteeRoles: boolean;
  canModerateContent: boolean;
};

export type UnionPermission = 
  | 'APPROVE_COMMITTEES'
  | 'APPROVE_SOCIETIES'
  | 'MODERATE_CONTENT'
  | 'MANAGE_UNIVERSITY_SETTINGS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_MEMBERS'
  | 'BULK_ACTIONS';

// Committee Request Types
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
  reviewer?: {
    id: string;
    fullName: string;
    role: UnionRole;
  };
};

export type CreateCommitteeRequestInput = {
  societyId: string;
  requestedRole: MemberRole;
  justification: string;
  supportingEvidence?: string[];
};

// University Management Types
export type University = {
  id: string;
  name: string;
  shortName: string;
  domain: string; // Email domain for verification
  location?: string;
  website?: string;
  studentUnionWebsite?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Counts
  _count?: {
    students: number;
    societies: number;
    unionAdmins: number;
  };
};

export type UniversitySettings = {
  requireEmailVerification: boolean;
  allowSelfSocietyCreation: boolean;
  requireSocietyApproval: boolean;
  requireCommitteeApproval: boolean;
  maxSocietiesPerStudent: number;
  defaultJoinPolicy: 'OPEN' | 'APPROVAL_REQUIRED' | 'VERIFIED_STUDENTS_ONLY';
  committeeRequestExpiryDays: number;
};

// Society Registration Types
export type SocietyRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CHANGES';

export type SocietyRegistrationRequest = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  universityId: string;
  requestedBy: string;
  proofOfRecognitionUrl?: string;
  supportingDocuments?: string[];
  status: SocietyRegistrationStatus;
  reviewerComments?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  
  // Populated data
  university?: University;
  requester?: {
    id: string;
    fullName: string;
    email: string;
    course?: string;
    year?: string;
  };
  reviewer?: {
    id: string;
    fullName: string;
    role: UnionRole;
  };
};

// Enhanced User Role Data for Union Admins.
// Note: `userRole` lives on UserRoleData (types/index.ts) — the single source of truth.
export type EnhancedUserRoleData = {
  unionAdminRelationships: UnionAdminRelationship[];
  hasUnionAdminAccess: boolean;
  canSwitchToUnionAdmin: boolean;
  selectedUniversityId: string | null;
};

// Notification Types
export type NotificationType = 
  | 'COMMITTEE_REQUEST_SUBMITTED'
  | 'COMMITTEE_REQUEST_APPROVED'
  | 'COMMITTEE_REQUEST_REJECTED'
  | 'SOCIETY_REQUEST_SUBMITTED'
  | 'SOCIETY_REQUEST_APPROVED'
  | 'SOCIETY_REQUEST_REJECTED';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  
  // Related data based on type
  relatedId?: string; // Committee request ID, society ID, etc.
  actionUrl?: string; // Deep link to relevant screen
};