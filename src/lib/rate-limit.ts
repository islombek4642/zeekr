export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

interface RateLimitState {
  store: Map<string, number[]>;
  calls: number;
}

const globalForRateLimit = globalThis as unknown as {
  __zeekrRateLimitState?: RateLimitState;
};

function getRateLimitState(): RateLimitState {
  if (!globalForRateLimit.__zeekrRateLimitState) {
    globalForRateLimit.__zeekrRateLimitState = {
      store: new Map<string, number[]>(),
      calls: 0,
    };
  }
  return globalForRateLimit.__zeekrRateLimitState;
}

function pruneExpired(store: Map<string, number[]>, now: number, windowMs: number) {
  const cutoff = now - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const active = timestamps.filter((ts) => ts > cutoff);
    if (active.length === 0) {
      store.delete(key);
    } else {
      store.set(key, active);
    }
  }
}

function pickRightmostHeaderIp(value: string | null): string | null {
  if (!value) return null;
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part.length <= 64 && !/\s/.test(part));
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

export function extractClientIp(headersLike: { get(name: string): string | null }): string {
  return (
    pickRightmostHeaderIp(headersLike.get('x-vercel-forwarded-for')) ??
    pickRightmostHeaderIp(headersLike.get('cf-connecting-ip')) ??
    pickRightmostHeaderIp(headersLike.get('x-real-ip')) ??
    pickRightmostHeaderIp(headersLike.get('x-forwarded-for')) ??
    'unknown'
  );
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 5;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;
  const state = getRateLimitState();

  state.calls += 1;
  if (state.calls % 100 === 0 || state.store.size > 1000) {
    pruneExpired(state.store, now, windowMs);
  }

  const existing = (state.store.get(key) ?? []).filter((ts) => ts > cutoff);

  if (existing.length >= limit) {
    const oldest = existing[0] ?? now;
    const resetAt = oldest + windowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
    state.store.set(key, existing);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      resetAt,
    };
  }

  existing.push(now);
  state.store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.length),
    retryAfterSeconds: 0,
    resetAt: now + windowMs,
  };
}

export function resetRateLimitStore(): void {
  const state = getRateLimitState();
  state.store.clear();
  state.calls = 0;
}
