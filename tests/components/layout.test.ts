import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from '@/lib/utils';

describe('Layout Formatting Utilities', () => {
  it('should format raw phone numbers into readable Uzbek display format', () => {
    expect(formatPhoneNumber('+998901234567')).toBe('+998 (90) 123-45-67');
    expect(formatPhoneNumber('998712000000')).toBe('+998 (71) 200-00-00');
  });

  it('should handle already formatted or irregular numbers gracefully', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

