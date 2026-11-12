import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs';

describe('Seed Data Loader', () => {
  const dataDir = path.join(process.cwd(), 'data');

  it('should load and validate seed datasets from data directory', () => {
    const models = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf-8'));
    const trims = JSON.parse(fs.readFileSync(path.join(dataDir, 'trims.json'), 'utf-8'));
    const colors = JSON.parse(fs.readFileSync(path.join(dataDir, 'colors.json'), 'utf-8'));
    const inventory = JSON.parse(fs.readFileSync(path.join(dataDir, 'inventory.json'), 'utf-8'));
    const settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf-8'));

    expect(models.length).toBeGreaterThanOrEqual(4);
    expect(trims.length).toBeGreaterThanOrEqual(8);
    expect(colors.length).toBeGreaterThanOrEqual(10);
    expect(inventory.length).toBeGreaterThanOrEqual(1);
    expect(settings.showroom_address).toBeDefined();

    // Verify relations link correctly
    for (const trim of trims) {
      const parentModel = models.find((m: any) => m.slug === trim.modelSlug);
      expect(parentModel, `Trim ${trim.name} references non-existent model ${trim.modelSlug}`).toBeDefined();
    }

    for (const color of colors) {
      const parentModel = models.find((m: any) => m.slug === color.modelSlug);
      expect(parentModel, `Color ${color.name} references non-existent model ${color.modelSlug}`).toBeDefined();
    }

    for (const item of inventory) {
      const parentTrim = trims.find((t: any) => t.name === item.trimName && t.modelSlug === item.modelSlug);
      expect(parentTrim, `Inventory item ${item.vinOrCode} references non-existent trim ${item.trimName}`).toBeDefined();
    }
  });
});

