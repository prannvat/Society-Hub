import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMeWithRoles, ApiUserAdminRole } from '@/services/api/me';
import {
  UserRoleData,
  SocietyAdminRelationship,
  AppMode,
} from '@/types';
import { mapMemberRole } from '@/utils/mapMemberRole';
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
  /** Kept for existing callers; true only while the first/next fetch is in flight. */
  isLoading: boolean;
  rolesStatus: RolesStatus;
  refreshUserRoles: () => Promise<void>;
  // Account switching (the seamless IG-style identity switch)
  activeAccount: ActiveAccount;
  switchToPersonal: () => Promise<void>;
  switchToSociety: (societyId: string) => Promise<void>;
};

/**
 * Whether society roles have actually been established. `error` is distinct from
 * `ready` with no roles — the UI must not present a failed fetch as "no access".
 */
export type RolesStatus = 'loading' | 'ready' | 'error';

const UserRolesContext = createContext<UserRolesContextValue | undefined>(undefined);

const mapApiAdminRolesToSocietyRelationships = (apiRoles: ApiUserAdminRole[]): SocietyAdminRelationship[] => {
  return apiRoles
    .filter(role => role.role === 'PRESIDENT' || role.role === 'COMMITTEE')
    .map(role => ({
      societyId: role.societyId,
      societyName: role.societyName,
      role: mapMemberRole(role.role),
      canManage: true,
    }));
};

export const UserRolesProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, activeUserId } = useAuth();
  const [rolesStatus, setRolesStatus] = useState<RolesStatus>('loading');
  const [adminSocieties, setAdminSocieties] = useState<SocietyAdminRelationship[]>([]);
  const [currentMode, setCurrentModeState] = useState<AppMode>('Consumer');
  const [selectedAdminSocietyId, setSelectedAdminSocietyId] = useState<string | null>(null);

  const refreshUserRoles = async () => {
    if (!isAuthenticated) {
      setAdminSocieties([]);
      setRolesStatus('ready');
      return;
    }

    setRolesStatus('loading');
    try {
      const userWithRoles = await fetchMeWithRoles();
      const mappedAdminSocieties = mapApiAdminRolesToSocietyRelationships(
        userWithRoles.adminRoles || [],
      );
      setAdminSocieties(mappedAdminSocieties);
      // Functional update so this doesn't read a `selectedAdminSocietyId` captured
      // before the account switch cleared it, which used to skip auto-selection.
      setSelectedAdminSocietyId((current) =>
        current ?? mappedAdminSocieties[0]?.societyId ?? null,
      );
      setRolesStatus('ready');
    } catch (error) {
      // Deliberately NOT clearing adminSocieties: an empty list is how the UI
      // says "you have no committee access", so wiping it on a network blip
      // silently demotes a president for the rest of their session. Keep the
      // last known roles and let callers surface the error instead.
      console.warn('Failed to fetch user roles:', error);
      setRolesStatus('error');
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
    isLoading: rolesStatus === 'loading',
    rolesStatus,
    refreshUserRoles,
    activeAccount,
    switchToPersonal,
    switchToSociety,
  }), [
    userRoleData,
    currentMode,
    selectedAdminSocietyId,
    rolesStatus,
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
