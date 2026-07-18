import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMeWithRoles, ApiUserAdminRole, ApiUnionAdminRole } from '@/services/api/me';
import { 
  UserRoleData, 
  SocietyAdminRelationship, 
  UnionAdminRelationship,
  EnhancedUserRoleData,
  AppMode, 
  MemberRole, 
  UserRole,
  UnionRole,
  UnionPermission
} from '@/types';
import { useAuth } from './useAuth';

/**
 * Instagram-style account identity the whole app acts as. Switching to a society
 * fully takes over the app (its own tab world), exactly like switching IG accounts.
 */
export type ActiveAccount =
  | { kind: 'personal' }
  | { kind: 'society'; societyId: string }
  | { kind: 'union'; universityId: string };

type UserRolesContextValue = UserRoleData & EnhancedUserRoleData & {
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => Promise<void>;
  selectedAdminSocietyId: string | null;
  setSelectedAdminSocietyId: (societyId: string | null) => void;
  selectedUniversityId: string | null;
  setSelectedUniversityId: (universityId: string | null) => void;
  isLoading: boolean;
  refreshUserRoles: () => Promise<void>;
  // Account switching (the seamless IG-style identity switch)
  activeAccount: ActiveAccount;
  switchToPersonal: () => Promise<void>;
  switchToSociety: (societyId: string) => Promise<void>;
  switchToUnion: (universityId: string) => Promise<void>;
};

const UserRolesContext = createContext<UserRolesContextValue | undefined>(undefined);

const mapApiRoleToMemberRole = (apiRole: string): MemberRole => {
  switch (apiRole) {
    case 'PRESIDENT':
      return 'President';
    case 'COMMITTEE':
      return 'Committee';
    default:
      return 'Member';
  }
};

const mapApiAdminRolesToSocietyRelationships = (apiRoles: ApiUserAdminRole[]): SocietyAdminRelationship[] => {
  return apiRoles
    .filter(role => role.role === 'PRESIDENT' || role.role === 'COMMITTEE')
    .map(role => ({
      societyId: role.societyId,
      societyName: role.societyName,
      role: mapApiRoleToMemberRole(role.role),
      canManage: true,
    }));
};

const mapApiUnionRolesToUnionRelationships = (apiRoles: ApiUnionAdminRole[]): UnionAdminRelationship[] => {
  return apiRoles.map(role => ({
    universityId: role.universityId,
    universityName: role.universityName,
    role: role.role,
    permissions: role.permissions as UnionPermission[],
    canManageAllSocieties: role.permissions.includes('MANAGE_MEMBERS'),
    canApproveCommitteeRoles: role.permissions.includes('APPROVE_COMMITTEES'),
    canModerateContent: role.permissions.includes('MODERATE_CONTENT'),
  }));
};

export const UserRolesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [adminSocieties, setAdminSocieties] = useState<SocietyAdminRelationship[]>([]);
  const [unionAdminRelationships, setUnionAdminRelationships] = useState<UnionAdminRelationship[]>([]);
  const [currentMode, setCurrentModeState] = useState<AppMode>('Consumer');
  const [selectedAdminSocietyId, setSelectedAdminSocietyId] = useState<string | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);

  const refreshUserRoles = async () => {
    if (!isAuthenticated) {
      setAdminSocieties([]);
      setUnionAdminRelationships([]);
      return;
    }

    setIsLoading(true);
    try {
      const userWithRoles = await fetchMeWithRoles();
      const adminRoles = userWithRoles.adminRoles || [];
      const unionRoles = userWithRoles.unionAdminRoles || [];
      
      const mappedAdminSocieties = mapApiAdminRolesToSocietyRelationships(adminRoles);
      const mappedUnionAdminRelationships = mapApiUnionRolesToUnionRelationships(unionRoles);
      
      setAdminSocieties(mappedAdminSocieties);
      setUnionAdminRelationships(mappedUnionAdminRelationships);
      
      // Auto-select first admin society if none selected
      if (mappedAdminSocieties.length > 0 && !selectedAdminSocietyId) {
        setSelectedAdminSocietyId(mappedAdminSocieties[0].societyId);
      }
      
      // Auto-select first university if none selected and user has union admin access
      if (mappedUnionAdminRelationships.length > 0 && !selectedUniversityId) {
        setSelectedUniversityId(mappedUnionAdminRelationships[0].universityId);
      }
    } catch (error) {
      console.warn('Failed to fetch user roles:', error);
      setAdminSocieties([]);
      setUnionAdminRelationships([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserRoles();
  }, [isAuthenticated]);

  const setCurrentMode = async (mode: AppMode) => {
    setCurrentModeState(mode);
    
    // Trigger any mode-specific data loading here
    // This could include clearing caches, loading admin-specific data, etc.
    if (mode === 'Admin') {
      // Load admin-specific data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    }
  };

  // Reset to consumer mode if user loses admin access
  useEffect(() => {
    if (adminSocieties.length === 0 && currentMode === 'Admin') {
      setCurrentMode('Consumer');
      setSelectedAdminSocietyId(null);
    }
    if (unionAdminRelationships.length === 0 && currentMode === 'UnionAdmin') {
      setCurrentMode('Consumer');
      setSelectedUniversityId(null);
    }
  }, [adminSocieties.length, unionAdminRelationships.length, currentMode]);

  const userRoleData: UserRoleData & EnhancedUserRoleData = useMemo(() => {
    const userRole: UserRole = unionAdminRelationships.length > 0 ? 'Admin' : 'Student';
    const hasAdminAccess = adminSocieties.length > 0;
    const canSwitchToAdmin = hasAdminAccess;
    const hasUnionAdminAccess = unionAdminRelationships.length > 0;
    const canSwitchToUnionAdmin = hasUnionAdminAccess;

    return {
      userRole,
      adminSocieties,
      hasAdminAccess,
      canSwitchToAdmin,
      unionAdminRelationships,
      hasUnionAdminAccess,
      canSwitchToUnionAdmin,
      selectedUniversityId,
    };
  }, [adminSocieties, unionAdminRelationships, selectedUniversityId]);

  const activeAccount: ActiveAccount = useMemo(() => {
    if (currentMode === 'Admin' && selectedAdminSocietyId) {
      return { kind: 'society', societyId: selectedAdminSocietyId };
    }
    if (currentMode === 'UnionAdmin' && selectedUniversityId) {
      return { kind: 'union', universityId: selectedUniversityId };
    }
    return { kind: 'personal' };
  }, [currentMode, selectedAdminSocietyId, selectedUniversityId]);

  const switchToPersonal = async () => {
    await setCurrentMode('Consumer');
  };

  const switchToSociety = async (societyId: string) => {
    setSelectedAdminSocietyId(societyId);
    await setCurrentMode('Admin');
  };

  const switchToUnion = async (universityId: string) => {
    setSelectedUniversityId(universityId);
    await setCurrentMode('UnionAdmin');
  };

  const contextValue: UserRolesContextValue = useMemo(() => ({
    ...userRoleData,
    currentMode,
    setCurrentMode,
    selectedAdminSocietyId,
    setSelectedAdminSocietyId,
    selectedUniversityId,
    setSelectedUniversityId,
    isLoading,
    refreshUserRoles,
    activeAccount,
    switchToPersonal,
    switchToSociety,
    switchToUnion,
  }), [
    userRoleData,
    currentMode,
    selectedAdminSocietyId,
    selectedUniversityId,
    isLoading,
    activeAccount,
  ]);

  return (
    <UserRolesContext.Provider value={contextValue}>
      {children}
    </UserRolesContext.Provider>
  );
};

export const useUserRoles = () => {
  const context = useContext(UserRolesContext);
  if (!context) {
    throw new Error('useUserRoles must be used within UserRolesProvider');
  }
  return context;
};