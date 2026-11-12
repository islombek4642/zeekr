import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Local Zeekr Car Images Assets', () => {
  const models = ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x'];
  const publicDir = path.join(process.cwd(), 'public', 'images', 'cars');

  it('should have local car image directories for all 4 models', () => {
    for (const model of models) {
      const modelDir = path.join(publicDir, model);
      expect(fs.existsSync(modelDir), `Directory missing for ${model}`).toBe(true);
      const mainImage = path.join(modelDir, 'main.jpg');
      expect(fs.existsSync(mainImage), `Main image missing for ${model}`).toBe(true);
      const stats = fs.statSync(mainImage);
      expect(stats.size).toBeGreaterThan(1000); // Must be a real non-empty image file
    }
  });
});
