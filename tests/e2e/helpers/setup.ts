import React from 'react';
import { vi } from 'vitest';
import {
  mockCookieStore,
  mockHeadersMap,
  mockRevalidatePath,
  mockNotFound,
  mockRedirect,
  mockUseRouter,
  mockUsePathname,
  mockUseSearchParams,
  resetNextMocks,
} from './next-mocks';
import { prismaMemoryClient, resetPrismaMemory } from './prisma-memory';

// Required because tsconfig.json sets "jsx": "preserve" without React plugin in Vitest
(globalThis as Record<string, unknown>).React = React;

export const TEST_JWT_SECRET = 'e2e-test-jwt-secret-key-2026-zeekr-uz';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
}

vi.mock('next/headers', () => ({
  cookies: async () => mockCookieStore,
  headers: async () => mockHeadersMap,
}));

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
  useRouter: mockUseRouter,
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMemoryClient,
}));

export function resetTestState(): void {
  resetNextMocks();
  resetPrismaMemory();
  process.env.JWT_SECRET = TEST_JWT_SECRET;
  delete process.env.E2E_TEST_NODE_ENV;
}

export {
  mockCookieStore,
  mockHeadersMap,
  revalidatedPaths,
  setMockNavigationState,
} from './next-mocks';
export { prismaMemoryClient, memoryStore, simulateDbDown } from './prisma-memory';
