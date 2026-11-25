export class MockCookieStore {
  private store = new Map<string, string>();

  get(name: string): { name: string; value: string } | undefined {
    const val = this.store.get(name);
    return val !== undefined ? { name, value: val } : undefined;
  }

  getAll(): Array<{ name: string; value: string }> {
    return Array.from(this.store.entries()).map(([name, value]) => ({ name, value }));
  }

  has(name: string): boolean {
    return this.store.has(name);
  }

  set(name: string, value: string, _options?: Record<string, unknown>): void {
    this.store.set(name, String(value));
  }

  delete(name: string): void {
    this.store.delete(name);
  }

  clear(): void {
    this.store.clear();
  }
}

export class MockHeadersMap {
  private map = new Map<string, string>();

  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) ?? null;
  }

  set(name: string, value: string): void {
    this.map.set(name.toLowerCase(), value);
  }

  has(name: string): boolean {
    return this.map.has(name.toLowerCase());
  }

  delete(name: string): void {
    this.map.delete(name.toLowerCase());
  }

  entries(): IterableIterator<[string, string]> {
    return this.map.entries();
  }

  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  values(): IterableIterator<string> {
    return this.map.values();
  }

  forEach(cb: (value: string, key: string) => void): void {
    this.map.forEach((v, k) => cb(v, k));
  }

  clear(): void {
    this.map.clear();
  }
}

export const mockCookieStore = new MockCookieStore();
export const mockHeadersMap = new MockHeadersMap();

export const revalidatedPaths: Array<{ path: string; type?: string }> = [];

export function mockRevalidatePath(path: string, type?: string): void {
  revalidatedPaths.push({ path, type });
}

export class NextNotFoundError extends Error {
  digest = 'NEXT_HTTP_ERROR_FALLBACK;404';
  constructor() {
    super('NEXT_NOT_FOUND');
    this.name = 'NextNotFoundError';
  }
}

export class NextRedirectError extends Error {
  digest: string;
  url: string;
  constructor(url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.name = 'NextRedirectError';
    this.url = url;
    this.digest = `NEXT_REDIRECT;replace;${url};307;`;
  }
}

export function mockNotFound(): never {
  throw new NextNotFoundError();
}

export function mockRedirect(url: string): never {
  throw new NextRedirectError(url);
}

let currentPathname = '/';
let currentSearchParams = new URLSearchParams();

export function setMockNavigationState(opts: { pathname?: string; search?: string }): void {
  if (opts.pathname !== undefined) currentPathname = opts.pathname;
  if (opts.search !== undefined) currentSearchParams = new URLSearchParams(opts.search);
}

export function mockUseRouter() {
  return {
    push: (_url: string) => {},
    replace: (_url: string) => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: async (_url: string) => {},
  };
}

export function mockUsePathname(): string {
  return currentPathname;
}

export function mockUseSearchParams(): URLSearchParams {
  return currentSearchParams;
}

export function resetNextMocks(): void {
  mockCookieStore.clear();
  mockHeadersMap.clear();
  revalidatedPaths.length = 0;
  currentPathname = '/';
  currentSearchParams = new URLSearchParams();
}
