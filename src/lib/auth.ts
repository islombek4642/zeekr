import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'zeekr-super-secret-admin-key-2026';

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getAdminSession(tokenOverride?: string): Promise<AdminTokenPayload | null> {
  if (tokenOverride) {
    return verifyToken(tokenOverride);
  }
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminTokenPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

