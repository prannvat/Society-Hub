import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { 
  CommitteeRequest, 
  CommitteeRequestStatus, 
  CreateCommitteeRequestInput 
} from '@/types/union-admin';
import {
  createCommitteeRequest,
  getMyCommitteeRequests,
  getCommitteeRequest,
  cancelCommitteeRequest,
  updateCommitteeRequest,
  getUniversityCommitteeRequests,
  approveCommitteeRequest,
  rejectCommitteeRequest,
  bulkApproveCommitteeRequests,
  bulkRejectCommitteeRequests,
  getCommitteeRequestStats,
} from '@/services/api/committee-requests';
import { useUserRoles } from './useUserRoles';
import { useAuth } from './useAuth';

type CommitteeRequestsContextValue = {
  // Student-facing functions
  myRequests: CommitteeRequest[];
  isLoadingMyRequests: boolean;
  submitRequest: (requestData: CreateCommitteeRequestInput) => Promise<CommitteeRequest>;
  cancelRequest: (requestId: string) => Promise<void>;
  updateRequest: (requestId: string, updates: Partial<CreateCommitteeRequestInput>) => Promise<CommitteeRequest>;
  refreshMyRequests: () => Promise<void>;
  
  // Union admin functions
  universityRequests: CommitteeRequest[];
  isLoadingUniversityRequests: boolean;
  totalUniversityRequests: number;
  hasMoreUniversityRequests: boolean;
  requestStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    byRole: Record<string, number>;
    bySociety: Array<{ societyId: string; societyName: string; count: number }>;
  } | null;
  isLoadingStats: boolean;
  
  loadUniversityRequests: (filters?: {
    status?: CommitteeRequestStatus;
    societyId?: string;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
  approveRequest: (requestId: string, comments?: string) => Promise<void>;
  rejectRequest: (requestId: string, reason: string) => Promise<void>;
  bulkApprove: (requestIds: string[], comments?: string) => Promise<void>;
  bulkReject: (requestIds: string[], reason: string) => Promise<void>;
  refreshStats: () => Promise<void>;
};

const CommitteeRequestsContext = createContext<CommitteeRequestsContextValue | undefined>(undefined);

export const CommitteeRequestsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { hasUnionAdminAccess, selectedUniversityId } = useUserRoles();
  
  // Student state
  const [myRequests, setMyRequests] = useState<CommitteeRequest[]>([]);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);
  
  // Union admin state
  const [universityRequests, setUniversityRequests] = useState<CommitteeRequest[]>([]);
  const [isLoadingUniversityRequests, setIsLoadingUniversityRequests] = useState(false);
  const [totalUniversityRequests, setTotalUniversityRequests] = useState(0);
  const [hasMoreUniversityRequests, setHasMoreUniversityRequests] = useState(false);
  const [requestStats, setRequestStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Student functions
  const refreshMyRequests = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingMyRequests(true);
    try {
      const requests = await getMyCommitteeRequests();
      setMyRequests(requests);
    } catch (error) {
      console.error('Failed to fetch my committee requests:', error);
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

  // Union admin functions
  const loadUniversityRequests = useCallback(async (filters?: {
    status?: CommitteeRequestStatus;
    societyId?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (!hasUnionAdminAccess || !selectedUniversityId) return;

    setIsLoadingUniversityRequests(true);
    try {
      const result = await getUniversityCommitteeRequests(selectedUniversityId, filters);
      
      if (filters?.offset && filters.offset > 0) {
        // Append to existing requests for pagination
        setUniversityRequests(prev => [...prev, ...result.requests]);
      } else {
        // Replace requests for new search/filter
        setUniversityRequests(result.requests);
      }
      
      setTotalUniversityRequests(result.total);
      setHasMoreUniversityRequests(result.hasMore);
    } catch (error) {
      console.error('Failed to fetch university committee requests:', error);
    } finally {
      setIsLoadingUniversityRequests(false);
    }
  }, [hasUnionAdminAccess, selectedUniversityId]);

  const approveRequest = useCallback(async (requestId: string, comments?: string): Promise<void> => {
    await approveCommitteeRequest(requestId, comments);
    
    // Update both lists if request exists in them
    const updateRequest = (req: CommitteeRequest) => 
      req.id === requestId 
        ? { ...req, status: 'APPROVED' as CommitteeRequestStatus, reviewerComments: comments, reviewedAt: new Date().toISOString() }
        : req;
    
    setMyRequests(prev => prev.map(updateRequest));
    setUniversityRequests(prev => prev.map(updateRequest));
  }, []);

  const rejectRequest = useCallback(async (requestId: string, reason: string): Promise<void> => {
    await rejectCommitteeRequest(requestId, reason);
    
    // Update both lists if request exists in them
    const updateRequest = (req: CommitteeRequest) => 
      req.id === requestId 
        ? { ...req, status: 'REJECTED' as CommitteeRequestStatus, reviewerComments: reason, reviewedAt: new Date().toISOString() }
        : req;
    
    setMyRequests(prev => prev.map(updateRequest));
    setUniversityRequests(prev => prev.map(updateRequest));
  }, []);

  const bulkApprove = useCallback(async (requestIds: string[], comments?: string): Promise<void> => {
    const result = await bulkApproveCommitteeRequests(requestIds, comments);
    
    // Update requests that were successfully approved
    const updateRequests = (reqs: CommitteeRequest[]) => 
      reqs.map(req => 
        result.approved.includes(req.id)
          ? { ...req, status: 'APPROVED' as CommitteeRequestStatus, reviewerComments: comments, reviewedAt: new Date().toISOString() }
          : req
      );
    
    setMyRequests(updateRequests);
    setUniversityRequests(updateRequests);
  }, []);

  const bulkReject = useCallback(async (requestIds: string[], reason: string): Promise<void> => {
    const result = await bulkRejectCommitteeRequests(requestIds, reason);
    
    // Update requests that were successfully rejected
    const updateRequests = (reqs: CommitteeRequest[]) => 
      reqs.map(req => 
        result.rejected.includes(req.id)
          ? { ...req, status: 'REJECTED' as CommitteeRequestStatus, reviewerComments: reason, reviewedAt: new Date().toISOString() }
          : req
      );
    
    setMyRequests(updateRequests);
    setUniversityRequests(updateRequests);
  }, []);

  const refreshStats = useCallback(async () => {
    if (!hasUnionAdminAccess || !selectedUniversityId) return;

    setIsLoadingStats(true);
    try {
      const stats = await getCommitteeRequestStats(selectedUniversityId);
      setRequestStats(stats);
    } catch (error) {
      // Handled/non-fatal: keep prior stats and let the UI show its empty/loading state.
      console.warn('Failed to fetch committee request stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [hasUnionAdminAccess, selectedUniversityId]);

  // Auto-load my requests when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshMyRequests();
    }
  }, [isAuthenticated, refreshMyRequests]);

  // Auto-load university requests when union admin context changes
  useEffect(() => {
    if (hasUnionAdminAccess && selectedUniversityId) {
      loadUniversityRequests();
      refreshStats();
    }
  }, [hasUnionAdminAccess, selectedUniversityId]);

  const value: CommitteeRequestsContextValue = {
    // Student functions
    myRequests,
    isLoadingMyRequests,
    submitRequest,
    cancelRequest,
    updateRequest,
    refreshMyRequests,
    
    // Union admin functions
    universityRequests,
    isLoadingUniversityRequests,
    totalUniversityRequests,
    hasMoreUniversityRequests,
    requestStats,
    isLoadingStats,
    loadUniversityRequests,
    approveRequest,
    rejectRequest,
    bulkApprove,
    bulkReject,
    refreshStats,
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