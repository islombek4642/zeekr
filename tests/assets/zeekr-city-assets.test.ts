import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

describe('Zeekr City Authentic Assets', () => {
  const models = ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x', 'zeekr-7x', 'zeekr-9x'];

  it('contains main studio cutout and interior photos for all 6 models', () => {
    for (const m of models) {
      const dir = path.join(process.cwd(), 'public/images/cars', m);
      expect(fs.existsSync(dir), `Missing dir for ${m}`).toBe(true);
      expect(
        fs.existsSync(path.join(dir, 'main.jpg')) || fs.existsSync(path.join(dir, 'main.webp')),
        `Missing main image in ${m}`
      ).toBe(true);
      expect(
        fs.existsSync(path.join(dir, 'interior.jpg')) || fs.existsSync(path.join(dir, 'interior.webp')),
        `Missing interior image in ${m}`
      ).toBe(true);
    }
  });

  it('contains web-optimized mp4 video loops for hero and model pages', () => {
    const videoDir = path.join(process.cwd(), 'public/videos/cars');
    expect(fs.existsSync(videoDir), 'Missing public/videos/cars directory').toBe(true);
    const videos = fs.readdirSync(videoDir).filter((f) => f.endsWith('.mp4'));
    expect(videos.length).toBeGreaterThanOrEqual(4);
  });
});
