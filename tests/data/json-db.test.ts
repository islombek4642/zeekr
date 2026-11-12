import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Categorized JSON Database Validation', () => {
  const dataDir = path.join(process.cwd(), 'data');

  it('should have all 6 required JSON database files', () => {
    const requiredFiles = [
      'models.json',
      'trims.json',
      'colors.json',
      'inventory.json',
      'settings.json',
      'technologies.json',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      expect(fs.existsSync(filePath), `Missing ${file}`).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      expect(parsed).toBeDefined();
    }
  });

  it('should have valid models dataset with 4 Zeekr models', () => {
    const models = JSON.parse(fs.readFileSync(path.join(dataDir, 'models.json'), 'utf-8'));
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBe(4);
    const slugs = models.map((m: any) => m.slug);
    expect(slugs).toContain('zeekr-001');
    expect(slugs).toContain('zeekr-007');
    expect(slugs).toContain('zeekr-009');
    expect(slugs).toContain('zeekr-x');
  });

  it('should have valid dynamic settings with all required keys', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf-8'));
    expect(settings.showroom_address).toBeDefined();
    expect(settings.primary_phone).toBeDefined();
    expect(Number(settings.usd_to_uzs_rate)).toBeGreaterThan(0);
    expect(Number(settings.default_loan_apr)).toBeGreaterThan(0);
  });
});
