import { Alert, Platform } from 'react-native';
import { DISPUTE_WINDOW_HOURS, EMAIL_DOMAIN } from './constants';

/**
 * Format an ISO date string into a readable locale string.
 * Example: "Feb 11, 2026, 3:45 PM"
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Return a human-friendly relative time string.
 * Examples: "just now", "2 min ago", "1 hour ago", "3 days ago"
 */
export function formatRelativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30)
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

/**
 * Validate that an email address ends with the allowed domain.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return trimmed.endsWith(`@${EMAIL_DOMAIN}`);
}

/**
 * Extract initials from a name string.
 * "Pedro Robledo" -> "PR", "Alice" -> "A", "" -> "?"
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncate text to a maximum length, appending an ellipsis if needed.
 */
export function truncateText(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text ?? '';
  return text.slice(0, maxLen).trimEnd() + '\u2026';
}

/**
 * Check whether the current time is still within the dispute window
 * relative to the completion timestamp.
 */
export function isWithinDisputeWindow(completedAt: string): boolean {
  const completed = new Date(completedAt).getTime();
  const now = Date.now();
  const windowMs = DISPUTE_WINDOW_HOURS * 60 * 60 * 1000;
  return now - completed <= windowMs;
}

/* ------------------------------------------------------------------ */
/* Cross-platform alert helpers                                        */
/* ------------------------------------------------------------------ */

/**
 * Show a simple alert message. Uses `window.alert` on web (where
 * React Native's `Alert.alert` is a no-op) and `Alert.alert` on native.
 */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Show a confirmation dialog. Returns `true` when the user confirms.
 * Uses `window.confirm` on web and `Alert.alert` with Cancel/OK on native.
 */
export function showConfirm(
  title: string,
  message: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
