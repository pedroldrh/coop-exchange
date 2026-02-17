/** Allowed email domain for OTP sign-in */
export const EMAIL_DOMAIN = 'mail.wlu.edu';

/** Every status a request can pass through */
export const REQUEST_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ORDERED: 'ordered',
  PICKED_UP: 'picked_up',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export type RequestStatus =
  (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

/** Post visibility status */
export const POST_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

/** Human-readable labels for request statuses */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  ordered: 'Ordered',
  picked_up: 'Picked Up',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

/** User role preferences (DB uses 'buyer'/'seller' internally) */
export const ROLE_PREFERENCE = {
  UPPERCLASSMAN: 'buyer',   // upperclassman requesting food
  FRESHMAN: 'seller',       // freshman donating swipes
  ADMIN: 'admin',
} as const;

export type RolePreference =
  (typeof ROLE_PREFERENCE)[keyof typeof ROLE_PREFERENCE];

/** Hours after completion within which a dispute may be opened */
export const DISPUTE_WINDOW_HOURS = 24;

/** Maximum star rating */
export const MAX_STARS = 5;

/** Dollar value of a single meal swipe */
export const SWIPE_VALUE = 11.50;

/** Supabase Storage bucket for proof images */
export const PROOFS_BUCKET = 'proofs';

/* ------------------------------------------------------------------ */
/* UI constants                                                        */
/* ------------------------------------------------------------------ */

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_CANCEL_REASON_LENGTH = 500;
export const MAX_ITEMS_TEXT_LENGTH = 1000;
export const MAX_COMMENT_LENGTH = 500;

export const PULL_REFRESH_THRESHOLD = 80;
export const PULL_REFRESH_DAMPENING = 0.4;

export const FAB_EXPANDED_WIDTH = 220;
export const FAB_COLLAPSED_WIDTH = 60;

export const LEADERBOARD_DEFAULT_LIMIT = 5;
