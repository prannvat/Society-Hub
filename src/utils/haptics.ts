import * as Haptics from 'expo-haptics';

/**
 * Thin haptics wrapper so every call site stays one word and failures never
 * surface (haptics are best-effort — a simulator or unsupported device simply
 * does nothing). Semantic names map to the right physical feedback:
 *
 * - tap:     a light tick for routine toggles (like, favourite, tab switch)
 * - select:  a medium tick for a committing choice (vote, RSVP)
 * - success: the notification success buzz for a real outcome (join, publish)
 * - warning / error: notification feedback for blocked or failed actions
 */
export const haptics = {
  tap: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  select: () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  error: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
