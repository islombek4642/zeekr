import { describe, it, expect, vi } from 'vitest';
import { getTechnologies, getDefaultSettings, getCarModels, getInStockVehicles } from '@/lib/data-provider';

describe('Data Provider', () => {
  it('should load technologies from data/technologies.json', () => {
    const tech = getTechnologies();
    expect(Array.isArray(tech)).toBe(true);
    expect(tech.length).toBeGreaterThanOrEqual(4);
    expect(tech[0].title).toBeDefined();
    expect(tech[0].icon).toBeDefined();
  });

  it('should load default site settings from data/settings.json', () => {
    const settings = getDefaultSettings();
    expect(settings.showroom_address).toBeDefined();
    expect(settings.primary_phone).toBeDefined();
    expect(settings.usd_to_uzs_rate).toBeGreaterThan(0);
  });

  it('should return car models list (from DB or JSON fallback)', async () => {
    const models = await getCarModels();
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBe(4);
    expect(models.some((m) => m.slug === 'zeekr-001')).toBe(true);
    expect(models.some((m) => m.slug === 'zeekr-007')).toBe(true);
  });

  it('should return in-stock inventory items', async () => {
    const items = await getInStockVehicles(4);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].vinOrCode).toBeDefined();
  });
});

