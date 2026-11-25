import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function collectTextFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTextFiles(fullPath));
    } else if (/\.(json|ts|tsx|js|jsx|css)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Local Zeekr Car Images Assets', () => {
  const models = ['zeekr-001', 'zeekr-007', 'zeekr-009', 'zeekr-x'];
  const publicDir = path.join(process.cwd(), 'public', 'images', 'cars');

  it('should have valid, optimized main.jpg and interior.jpg JPEGs for all 4 models', () => {
    for (const model of models) {
      const modelDir = path.join(publicDir, model);
      expect(fs.existsSync(modelDir), `Directory missing for ${model}`).toBe(true);

      for (const fileName of ['main.jpg', 'interior.jpg']) {
        const imagePath = path.join(modelDir, fileName);
        expect(fs.existsSync(imagePath), `${fileName} missing for ${model}`).toBe(true);

        const buf = fs.readFileSync(imagePath);
        expect(buf.length, `${model}/${fileName} too small`).toBeGreaterThan(1000);
        expect(buf.length, `${model}/${fileName} exceeds 500 KB`).toBeLessThan(500_000);

        // Verify JPEG magic bytes (FF D8 FF)
        expect(buf[0], `${model}/${fileName} invalid JPEG byte 0`).toBe(0xff);
        expect(buf[1], `${model}/${fileName} invalid JPEG byte 1`).toBe(0xd8);
        expect(buf[2], `${model}/${fileName} invalid JPEG byte 2`).toBe(0xff);
      }
    }
  });

  it('should have zero Unsplash URLs remaining in data/ or src/', () => {
    const filesToCheck = [
      ...collectTextFiles(path.join(process.cwd(), 'data')),
      ...collectTextFiles(path.join(process.cwd(), 'src')),
    ];
    expect(filesToCheck.length).toBeGreaterThan(0);

    for (const filePath of filesToCheck) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.toLowerCase(), `Found unsplash reference in ${filePath}`).not.toContain('unsplash');
    }
  });
});
