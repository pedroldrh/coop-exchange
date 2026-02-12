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

/** Color codes for each request status (mobile-friendly palette) */
export const STATUS_COLORS: Record<RequestStatus, string> = {
  requested: '#F59E0B', // amber
  accepted: '#3B82F6',  // blue
  ordered: '#6366F1',   // indigo
  picked_up: '#0EA5E9', // sky
  completed: '#22C55E', // green
  cancelled: '#EF4444', // red
  disputed: '#F97316',  // orange
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
