import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getAdminSession, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate ADMIN via cookies, header, or getAdminSession
    let token = req.cookies.get('admin_token')?.value;
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/admin_token=([^;]+)/);
      if (match) token = match[1];
    }
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    let session = token ? await verifyToken(token) : await getAdminSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 401 });
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Noto\'g\'ri form-data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fayl tanlanmagan' }, { status: 400 });
    }

    // 3. Size check (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fayl hajmi 10MB dan oshmasligi kerak' }, { status: 400 });
    }

    // 4. Mime type check
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Faqat JPEG, PNG yoki WebP formatlari qabul qilinadi' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 5. Magic bytes verification
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    const isWebp =
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ error: 'Fayl haqiqiy rasm formatiga to\'g\'ri kelmadi' }, { status: 400 });
    }

    // 6. Safe collision-free filename
    const ext = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const filename = `${Date.now()}-${uniqueId}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const relativeUrl = `/images/uploads/${filename}`;
    return NextResponse.json({ success: true, url: relativeUrl }, { status: 201 });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Faylni yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
