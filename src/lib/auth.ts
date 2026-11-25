import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getJwtSecret } from './jwt-secret';

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: AdminTokenPayload): Promise<string> {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn: '7d' });
}

export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] }) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(tokenOverride?: string): Promise<AdminTokenPayload | null> {
  let payload: AdminTokenPayload | null = null;
  if (tokenOverride) {
    payload = await verifyToken(tokenOverride);
  } else {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('admin_token')?.value;
      if (!token) return null;
      payload = await verifyToken(token);
    } catch {
      return null;
    }
  }

  if (!payload || payload.role !== 'ADMIN') {
    return null;
  }

  return payload;
}

export async function requireAdminSession(): Promise<AdminTokenPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
