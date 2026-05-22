import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = db
      .prepare(`SELECT COUNT(*) as count FROM submissions ${where}`)
      .get(...params) as { count: number };
    const total = countRow.count;

    const submissions = db
      .prepare(`SELECT * FROM submissions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset);

    return NextResponse.json({ submissions, total, page, limit });
  } catch (err) {
    console.error('[GET /api/submissions]', err);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, affiliation, age_group, gender, purpose, ai_experience, interest_areas, comments } =
      body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '이름은 필수 항목입니다.' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: '이메일은 필수 항목입니다.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '유효하지 않은 이메일 형식입니다.' }, { status: 400 });
    }

    const db = getDb();
    const areasJson = Array.isArray(interest_areas) ? JSON.stringify(interest_areas) : interest_areas || null;

    const result = db
      .prepare(
        `INSERT INTO submissions
           (name, email, phone, affiliation, age_group, gender, purpose, ai_experience, interest_areas, comments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name.trim(), email.trim(),
        phone || null, affiliation || null, age_group || null,
        gender || null, purpose || null, ai_experience || null,
        areasJson, comments || null,
      );

    return NextResponse.json(
      { id: Number(result.lastInsertRowid), message: '신청이 완료되었습니다.' },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/submissions]', err);
    return NextResponse.json({ error: '신청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
