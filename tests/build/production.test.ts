import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Readiness & Vercel Configuration', () => {
  it('should have package.json scripts with prisma generate', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toContain('prisma generate');
  });

  it('should have vercel.json configuration', () => {
    const vercelConfigExists = fs.existsSync(path.join(process.cwd(), 'vercel.json'));
    expect(vercelConfigExists).toBe(true);
  });

  it('should document essential environment variables in .env.example', () => {
    const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf-8');
    expect(envExample).toContain('DATABASE_URL');
    expect(envExample).toContain('JWT_SECRET');
  });
});

