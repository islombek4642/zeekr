import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Database Models & Relations', () => {
  it('should instantiate Prisma client without throwing and expose expected models', () => {
    expect(prisma).toBeDefined();
    expect(prisma.carModel).toBeDefined();
    expect(prisma.carTrim).toBeDefined();
    expect(prisma.carColor).toBeDefined();
    expect(prisma.inventoryItem).toBeDefined();
    expect(prisma.setting).toBeDefined();
    expect(prisma.lead).toBeDefined();
    expect(prisma.user).toBeDefined();
  });
});
