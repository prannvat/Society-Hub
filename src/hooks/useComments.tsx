import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { CommentsSheet } from '@/components/CommentsSheet';

type CommentsContextValue = {
  openComments: (announcementId: string) => void;
  closeComments: () => void;
};

const CommentsContext = createContext<CommentsContextValue | undefined>(undefined);

/** Mounts a single app-wide comments sheet, openable from any post surface. */
export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const [announcementId, setAnnouncementId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const openComments = useCallback((id: string) => {
    setAnnouncementId(id);
    setVisible(true);
  }, []);
  const closeComments = useCallback(() => setVisible(false), []);

  const value = useMemo(() => ({ openComments, closeComments }), [openComments, closeComments]);

  return (
    <CommentsContext.Provider value={value}>
      {children}
      <CommentsSheet announcementId={announcementId} visible={visible} onClose={closeComments} />
    </CommentsContext.Provider>
  );
};

export const useComments = () => {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error('useComments must be used within CommentsProvider');
  }
  return ctx;
};
