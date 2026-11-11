import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
