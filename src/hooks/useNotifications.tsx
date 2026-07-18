import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationsRead,
  Notification,
  registerPushToken,
} from '@/services/api/notifications';

type NotificationsContextValue = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 60_000;

// Show a banner + play sound for pushes that arrive while the app is foregrounded.
// Guarded because expo-notifications may be unavailable in some runtimes.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // no-op — foreground handler is best-effort
}

/**
 * Best-effort Expo push registration. Requests permission, resolves the Expo push
 * token, and reports it to the backend. Remote push requires a dev build — in Expo
 * Go on SDK 54 token resolution throws/warns, so EVERYTHING is wrapped and fails
 * silently (no crash, no spam).
 */
async function registerForPush(): Promise<void> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return;

    // EAS project id, when configured, is required for the token in a dev build.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;

    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (token?.data) {
      await registerPushToken(token.data);
    }
  } catch {
    // Expo Go / no dev build / no permission — silently no-op.
  }
}

/**
 * App-wide notifications state: an unread badge count kept fresh by lightweight
 * polling (mount, app-foreground, and every ~60s while active) plus the inbox list.
 * All network work fails silently so a flaky backend never disrupts the UI.
 */
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, activeUserId } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { count } = await fetchUnreadCount();
      setUnreadCount(Math.max(0, count));
    } catch {
      // fail silent — keep the last known count
    }
  }, [isAuthenticated]);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const list = await fetchNotifications();
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch {
      // fail silent
    }
  }, [isAuthenticated]);

  const markAllRead = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
    setUnreadCount(0);
    try {
      await markNotificationsRead();
    } catch {
      // fail silent — reconcile on next poll
    }
  }, [isAuthenticated]);

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!isAuthenticated || ids.length === 0) return;
      const idSet = new Set(ids);
      setNotifications((prev) =>
        prev.map((n) => (idSet.has(n.id) && !n.read ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
      try {
        await markNotificationsRead(ids);
      } catch {
        // fail silent
      }
    },
    [isAuthenticated],
  );

  // Reset state on logout / account switch, then (re)start polling + push for the active user.
  useEffect(() => {
    setUnreadCount(0);
    setNotifications([]);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isAuthenticated) return;

    void refreshUnread();
    void registerForPush();

    intervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') void refreshUnread();
    }, POLL_INTERVAL_MS);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void refreshUnread();
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      sub.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // activeUserId re-runs this so a switch resets + re-registers under the new token/user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, activeUserId, refreshUnread]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnread, notifications, loadNotifications, markAllRead, markRead }),
    [unreadCount, refreshUnread, notifications, loadNotifications, markAllRead, markRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
};
