export const DEV_JWT_FALLBACK = 'zeekr-dev-only-jwt-secret-not-for-production';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }

  return DEV_JWT_FALLBACK;
}
