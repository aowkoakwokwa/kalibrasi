import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'Saga12345#';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content-type' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('lampiran') as File | null;
    const hash = crypto.createHmac('sha256', SECRET_KEY).digest('base64');
    const finalEncoded = hash.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const newFileName = `${randomUUID()}-${finalEncoded}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public/lampiran/ncr');
    const filePath = path.join(uploadDir, newFileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: newFileName,
    });
  } catch (error: unknown) {
    console.error('Error handling form data:', error);

    const message =
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Unknown error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
