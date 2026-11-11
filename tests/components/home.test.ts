import { describe, it, expect } from 'vitest';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';

describe('Home Page Currency and Specs Helpers', () => {
  it('should format prices correctly in USD and UZS based on exchange rate', () => {
    expect(formatCurrencyUSD(45000)).toBe('$45,000');
    expect(formatCurrencyUZS(45000, 12850)).toBe("578,250,000 so'm");
  });

  it('should handle zero or boundary values appropriately', () => {
    expect(formatCurrencyUSD(0)).toBe('$0');
    expect(formatCurrencyUZS(0, 12850)).toBe("0 so'm");
  });
});

