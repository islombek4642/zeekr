import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { seedDatabase } from '../../../../../prisma/seed';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check cookie if header not provided
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get('admin_token')?.value;
      } catch {
        // cookies() may throw in non-standard request contexts
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin token talab qilinadi' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Faqat admin foydalanuvchilar ruxsat etilgan' },
        { status: 401 }
      );
    }

    // 3. Execute seed from JSON
    const result = await seedDatabase();

    return NextResponse.json({
      success: true,
      message: "Ma'lumotlar bazasi JSON fayllar asosida muvaffaqiyatli to'ldirildi va yangilandi!",
      result,
    });
  } catch (err: any) {
    console.error('[API ADMIN SEED ERROR]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Bazani to'ldirishda kutilmagan xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}

