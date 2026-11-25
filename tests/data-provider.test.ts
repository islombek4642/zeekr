import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getTechnologies,
  getDefaultSettings,
  getCarModels,
  getCarModelBySlug,
  getInStockVehicles,
  getInventoryCatalogData,
} from '@/lib/data-provider';
import { prisma } from '@/lib/prisma';
import { findReserveVehicle } from '@/lib/inventory-filter';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

import { InventoryCatalog } from '@/components/inventory/InventoryCatalog';

describe('Data Provider', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    expect(models.length).toBe(6);
    expect(models.some((m) => m.slug === 'zeekr-001')).toBe(true);
    expect(models.some((m) => m.slug === 'zeekr-007')).toBe(true);
    expect(models.some((m) => m.slug === 'zeekr-7x')).toBe(true);
    expect(models.some((m) => m.slug === 'zeekr-9x')).toBe(true);
  });

  it('should return in-stock inventory items', async () => {
    const items = await getInStockVehicles(4);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].vinOrCode).toBeDefined();
  });

  it('should return active model with trims and colors via JSON fallback in getCarModelBySlug', async () => {
    const model = await getCarModelBySlug('zeekr-001');
    expect(model).not.toBeNull();
    expect(model?.slug).toBe('zeekr-001');
    expect(Array.isArray(model?.trims)).toBe(true);
    expect(model?.trims.length).toBeGreaterThan(0);
    expect(Array.isArray(model?.colors)).toBe(true);
    expect(model?.colors.length).toBeGreaterThan(0);

    const missing = await getCarModelBySlug('unknown-model-slug');
    expect(missing).toBeNull();
  });

  it('should return null when DB returns an inactive model or DB already has models and slug is missing', async () => {
    vi.spyOn(prisma.carModel, 'findUnique').mockResolvedValueOnce({
      id: 'm-inactive',
      slug: 'zeekr-001',
      name: 'Zeekr 001',
      tagline: 'Inactive',
      basePriceUSD: 45000,
      acceleration0100: 3.8,
      rangeKm: 741,
      batteryKwh: 100,
      powerHp: 544,
      topSpeedKmH: 200,
      chargingTimeMin: 15,
      mainImage: '/images/cars/zeekr-001/main.jpg',
      galleryImages: [],
      description: 'Desc',
      isActive: false,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const inactiveResult = await getCarModelBySlug('zeekr-001');
    expect(inactiveResult).toBeNull();

    vi.spyOn(prisma.carModel, 'findUnique').mockResolvedValueOnce(null);
    vi.spyOn(prisma.carModel, 'count').mockResolvedValueOnce(4);
    const missingInDbResult = await getCarModelBySlug('zeekr-001');
    expect(missingInDbResult).toBeNull();
  });

  it('should return inventory catalog data with items and 6 active models via JSON fallback', async () => {
    const catalog = await getInventoryCatalogData();
    expect(catalog.models.length).toBe(6);
    expect(catalog.items.length).toBeGreaterThanOrEqual(1);
    expect(catalog.items[0].id).toBe(catalog.items[0].vinOrCode);
    expect(catalog.items[0].trim.model.slug).toBeDefined();
  });

  it('should match ?reserve= by id or vinOrCode and open ReserveModal in InventoryCatalog', async () => {
    const catalog = await getInventoryCatalogData();
    const firstItem = catalog.items[0];
    expect(firstItem).toBeDefined();

    expect(findReserveVehicle(catalog.items, firstItem.id)?.id).toBe(firstItem.id);
    if (firstItem.vinOrCode) {
      expect(findReserveVehicle(catalog.items, firstItem.vinOrCode)?.id).toBe(firstItem.id);
    }
    expect(findReserveVehicle(catalog.items, 'NON-EXISTENT-ID')).toBeNull();

    const htmlWithReserve = renderToStaticMarkup(
      React.createElement(InventoryCatalog, {
        initialItems: catalog.items,
        models: catalog.models,
        usdRate: 12700,
        initialReserveId: firstItem.id,
      })
    );
    expect(htmlWithReserve).toContain('role="dialog"');
    expect(htmlWithReserve).toContain(firstItem.trim.model.name);

    const htmlWithoutReserve = renderToStaticMarkup(
      React.createElement(InventoryCatalog, {
        initialItems: catalog.items,
        models: catalog.models,
        usdRate: 12700,
      })
    );
    expect(htmlWithoutReserve).not.toContain('role="dialog"');
  });
});
