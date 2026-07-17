import { useCallback } from 'react';
import { useUserRoles } from './useUserRoles';
import { apiRequest, RequestOptions } from '@/services/api/client';

/**
 * Hook that provides admin API functionality with automatic society context
 */
export const useAdminApi = () => {
  const { selectedAdminSocietyId, currentMode } = useUserRoles();

  const adminApiRequest = useCallback(
    <T>(path: string, options: Omit<RequestOptions, 'requiresAdmin' | 'societyId'> = {}) => {
      if (currentMode !== 'Admin' || !selectedAdminSocietyId) {
        throw new Error('Admin API calls require admin mode and selected society');
      }

      return apiRequest<T>(path, {
        ...options,
        requiresAdmin: true,
        societyId: selectedAdminSocietyId,
      });
    },
    [selectedAdminSocietyId, currentMode]
  );

  const isAdminContext = currentMode === 'Admin' && Boolean(selectedAdminSocietyId);

  return {
    adminApiRequest,
    isAdminContext,
    selectedAdminSocietyId,
  };
};