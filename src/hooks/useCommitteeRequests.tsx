import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { CommitteeRequest, CreateCommitteeRequestInput } from '@/types';
import {
  createCommitteeRequest,
  getMyCommitteeRequests,
  cancelCommitteeRequest,
  updateCommitteeRequest,
} from '@/services/api/committee-requests';
import { useAuth } from './useAuth';

/**
 * Student-facing committee role requests. Students raise and manage their own
 * requests here; review/approval happens in the students' union web portal.
 */
type CommitteeRequestsContextValue = {
  myRequests: CommitteeRequest[];
  isLoadingMyRequests: boolean;
  submitRequest: (requestData: CreateCommitteeRequestInput) => Promise<CommitteeRequest>;
  cancelRequest: (requestId: string) => Promise<void>;
  updateRequest: (requestId: string, updates: Partial<CreateCommitteeRequestInput>) => Promise<CommitteeRequest>;
  refreshMyRequests: () => Promise<void>;
};

const CommitteeRequestsContext = createContext<CommitteeRequestsContextValue | undefined>(undefined);

export const CommitteeRequestsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  const [myRequests, setMyRequests] = useState<CommitteeRequest[]>([]);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);

  const refreshMyRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingMyRequests(true);
    try {
      const requests = await getMyCommitteeRequests();
      setMyRequests(requests);
    } catch (error) {
      // Handled and non-fatal: the screen falls back to its empty state. Logged as
      // a warning so a transient network blip never throws a red box at the user.
      console.warn('Failed to fetch my committee requests:', error);
    } finally {
      setIsLoadingMyRequests(false);
    }
  }, [isAuthenticated]);

  const submitRequest = useCallback(async (requestData: CreateCommitteeRequestInput): Promise<CommitteeRequest> => {
    const newRequest = await createCommitteeRequest(requestData);
    setMyRequests(prev => [newRequest, ...prev]);
    return newRequest;
  }, []);

  const cancelRequest = useCallback(async (requestId: string): Promise<void> => {
    await cancelCommitteeRequest(requestId);
    setMyRequests(prev => prev.filter(req => req.id !== requestId));
  }, []);

  const updateRequest = useCallback(async (
    requestId: string,
    updates: Partial<CreateCommitteeRequestInput>
  ): Promise<CommitteeRequest> => {
    const updatedRequest = await updateCommitteeRequest(requestId, updates);
    setMyRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
    return updatedRequest;
  }, []);

  // Auto-load my requests when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshMyRequests();
    }
  }, [isAuthenticated, refreshMyRequests]);

  const value: CommitteeRequestsContextValue = {
    myRequests,
    isLoadingMyRequests,
    submitRequest,
    cancelRequest,
    updateRequest,
    refreshMyRequests,
  };

  return (
    <CommitteeRequestsContext.Provider value={value}>
      {children}
    </CommitteeRequestsContext.Provider>
  );
};

export const useCommitteeRequests = () => {
  const context = useContext(CommitteeRequestsContext);
  if (!context) {
    throw new Error('useCommitteeRequests must be used within CommitteeRequestsProvider');
  }
  return context;
};
