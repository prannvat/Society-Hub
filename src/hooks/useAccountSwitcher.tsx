import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { AccountSwitcher } from '@/components/AccountSwitcher';

type AccountSwitcherContextValue = {
  openSwitcher: () => void;
  closeSwitcher: () => void;
};

const AccountSwitcherContext = createContext<AccountSwitcherContextValue | undefined>(undefined);

/**
 * Mounts a single app-wide account switcher and lets any surface open it — the
 * Profile-tab double-tap, tapping your name/avatar, or the managing bar.
 */
export const AccountSwitcherProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const openSwitcher = useCallback(() => setOpen(true), []);
  const closeSwitcher = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openSwitcher, closeSwitcher }), [openSwitcher, closeSwitcher]);

  return (
    <AccountSwitcherContext.Provider value={value}>
      {children}
      <AccountSwitcher visible={open} onClose={closeSwitcher} />
    </AccountSwitcherContext.Provider>
  );
};

export const useAccountSwitcher = () => {
  const ctx = useContext(AccountSwitcherContext);
  if (!ctx) {
    throw new Error('useAccountSwitcher must be used within AccountSwitcherProvider');
  }
  return ctx;
};
