import { describe, it, expect } from 'vitest';
import { getContactDisplayInfo } from '@/lib/settings';

describe('Dynamic Contacts Helper', () => {
  it('should correctly format company contact info from settings object', () => {
    const mockSettings = {
      showroom_address: 'Toshkent sh., Yunusobod tumani, 4-mavze',
      primary_phone: '+998712000000',
      working_hours: '09:00 - 20:00',
    };
    const display = getContactDisplayInfo(mockSettings as any);
    expect(display.address).toBe('Toshkent sh., Yunusobod tumani, 4-mavze');
    expect(display.phone).toBe('+998712000000');
  });

  it('should handle missing or empty values with clean defaults', () => {
    const emptySettings = {};
    const display = getContactDisplayInfo(emptySettings as any);
    expect(display.address).toBe('');
    expect(display.phone).toBe('');
  });
});

