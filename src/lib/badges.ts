export type BadgeTier = {
  id: string;
  label: string;
  icon: string;
  threshold: number;
  color: string;
};

/** Milestone badges ordered by threshold (ascending) */
export const BADGE_TIERS: BadgeTier[] = [
  { id: 'first',    label: 'First Swipe', icon: '🌱', threshold: 1,  color: '#10B981' },
  { id: 'helper',   label: 'Helper',      icon: '🤝', threshold: 5,  color: '#3B82F6' },
  { id: 'regular',  label: 'Regular',     icon: '⭐', threshold: 10, color: '#8B5CF6' },
  { id: 'allstar',  label: 'All-Star',    icon: '🔥', threshold: 25, color: '#F59E0B' },
  { id: 'legend',   label: 'Legend',       icon: '👑', threshold: 50, color: '#EF4444' },
];

/** Get all badges earned for a given completed count */
export function getEarnedBadges(completedCount: number): BadgeTier[] {
  return BADGE_TIERS.filter((b) => completedCount >= b.threshold);
}

/** Get the highest badge earned (or null if none) */
export function getTopBadge(completedCount: number): BadgeTier | null {
  const earned = getEarnedBadges(completedCount);
  return earned.length > 0 ? earned[earned.length - 1] : null;
}

/** Get the next badge to earn (or null if all earned) */
export function getNextBadge(completedCount: number): BadgeTier | null {
  return BADGE_TIERS.find((b) => completedCount < b.threshold) ?? null;
}
