export type LeadStatusType = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'DEAL_WON' | 'CANCELLED';

const ALLOWED_TRANSITIONS: Record<LeadStatusType, LeadStatusType[]> = {
  NEW: ['CONTACTED', 'CANCELLED', 'SCHEDULED'],
  CONTACTED: ['SCHEDULED', 'DEAL_WON', 'CANCELLED'],
  SCHEDULED: ['DEAL_WON', 'CANCELLED', 'CONTACTED'],
  DEAL_WON: [],
  CANCELLED: ['CONTACTED'],
};

export function isValidStatusTransition(current: string, next: string): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_TRANSITIONS[current as LeadStatusType];
  if (!allowed) return false;
  return allowed.includes(next as LeadStatusType);
}
