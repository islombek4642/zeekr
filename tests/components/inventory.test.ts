import { describe, it, expect } from 'vitest';
import { filterInventoryItems } from '@/lib/inventory-filter';

describe('Inventory Filter Utility', () => {
  const sampleItems = [
    { id: '1', modelSlug: 'zeekr-001', status: 'IN_STOCK', color: 'White' },
    { id: '2', modelSlug: 'zeekr-007', status: 'IN_TRANSIT', color: 'Black' },
    { id: '3', modelSlug: 'zeekr-001', status: 'IN_TRANSIT', color: 'Grey' },
  ];

  it('should filter items by model and availability status', () => {
    const filtered = filterInventoryItems(sampleItems as any, { modelSlug: 'zeekr-001' });
    expect(filtered.length).toBe(2);
    expect(filtered.map(i => i.id)).toEqual(['1', '3']);
  });

  it('should filter items by status', () => {
    const filtered = filterInventoryItems(sampleItems as any, { status: 'IN_STOCK' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter items by model and status simultaneously', () => {
    const filtered = filterInventoryItems(sampleItems as any, { modelSlug: 'zeekr-001', status: 'IN_TRANSIT' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('3');
  });

  it('should return all items when filter is empty or all', () => {
    const filtered = filterInventoryItems(sampleItems as any, {});
    expect(filtered.length).toBe(3);
  });
});

