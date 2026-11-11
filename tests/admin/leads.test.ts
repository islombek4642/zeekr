import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from '@/lib/lead-workflow';

describe('Lead Status Workflow', () => {
  it('should validate allowed status transitions', () => {
    expect(isValidStatusTransition('NEW', 'CONTACTED')).toBe(true);
    expect(isValidStatusTransition('CONTACTED', 'SCHEDULED')).toBe(true);
    expect(isValidStatusTransition('SCHEDULED', 'DEAL_WON')).toBe(true);
    expect(isValidStatusTransition('NEW', 'CANCELLED')).toBe(true);
    expect(isValidStatusTransition('DEAL_WON', 'NEW')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'NEW')).toBe(false);
  });
});
