import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMeWithRoles, ApiUserAdminRole } from '@/services/api/me';
import {
  UserRoleData,
  SocietyAdminRelationship,
  AppMode,
  MemberRole,
} from '@/types';
import { useAuth } from './useAuth';

/**
 * Instagram-style account identity the whole app acts as. Switching to a society
 * fully takes over the app (its own tab world), exactly like switching IG accounts.
 */
export type ActiveAccount =
  | { kind: 'personal' }
  | { kind: 'society'; societyId: string };

type UserRolesContextValue = UserRoleData & {
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => Promise<void>;
  selectedAdminSocietyId: string | null;
  setSelectedAdminSocietyId: (societyId: string | null) => void;
  isLoading: boolean;
  refreshUserRoles: () => Promise<void>;
  // Account switching (the seamless IG-style identity switch)
  activeAccount: ActiveAccount;
  switchToPersonal: () => Promise<void>;
  switchToSociety: (societyId: string) => Promise<void>;
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

export const UserRolesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, activeUserId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [adminSocieties, setAdminSocieties] = useState<SocietyAdminRelationship[]>([]);
  const [currentMode, setCurrentModeState] = useState<AppMode>('Consumer');
  const [selectedAdminSocietyId, setSelectedAdminSocietyId] = useState<string | null>(null);

  const refreshUserRoles = async () => {
    if (!isAuthenticated) {
      setAdminSocieties([]);
      return;
    }

    setIsLoading(true);
    try {
      const userWithRoles = await fetchMeWithRoles();
      const adminRoles = userWithRoles.adminRoles || [];

      const mappedAdminSocieties = mapApiAdminRolesToSocietyRelationships(adminRoles);
      setAdminSocieties(mappedAdminSocieties);

      // Auto-select first admin society if none selected
      if (mappedAdminSocieties.length > 0 && !selectedAdminSocietyId) {
        setSelectedAdminSocietyId(mappedAdminSocieties[0].societyId);
      }
    } catch (error) {
      console.warn('Failed to fetch user roles:', error);
      setAdminSocieties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch roles whenever the active account changes (login, switch, add-account).
  // A different person has different society roles, so drop back to personal mode.
  useEffect(() => {
    setCurrentModeState('Consumer');
    setSelectedAdminSocietyId(null);
    refreshUserRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeUserId]);

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
  }, [adminSocieties.length, currentMode]);

  const userRoleData: UserRoleData = useMemo(() => {
    const hasAdminAccess = adminSocieties.length > 0;

    return {
      adminSocieties,
      hasAdminAccess,
      canSwitchToAdmin: hasAdminAccess,
    };
  }, [adminSocieties]);

  const activeAccount: ActiveAccount = useMemo(() => {
    if (currentMode === 'Admin' && selectedAdminSocietyId) {
      return { kind: 'society', societyId: selectedAdminSocietyId };
    }
    return { kind: 'personal' };
  }, [currentMode, selectedAdminSocietyId]);

  const switchToPersonal = async () => {
    await setCurrentMode('Consumer');
  };

  const switchToSociety = async (societyId: string) => {
    setSelectedAdminSocietyId(societyId);
    await setCurrentMode('Admin');
  };

  const contextValue: UserRolesContextValue = useMemo(() => ({
    ...userRoleData,
    currentMode,
    setCurrentMode,
    selectedAdminSocietyId,
    setSelectedAdminSocietyId,
    isLoading,
    refreshUserRoles,
    activeAccount,
    switchToPersonal,
    switchToSociety,
  }), [
    userRoleData,
    currentMode,
    selectedAdminSocietyId,
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
