import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!row) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error('[GET /api/submissions/:id]', err);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare('SELECT id FROM submissions WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name, email, phone, affiliation, age_group, gender,
      purpose, ai_experience, interest_areas, comments, status,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: '이름은 필수 항목입니다.' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
    }
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
    }

    const areasJson = Array.isArray(interest_areas) ? JSON.stringify(interest_areas) : interest_areas || null;

    db.prepare(
      `UPDATE submissions SET
        name = ?, email = ?, phone = ?, affiliation = ?,
        age_group = ?, gender = ?, purpose = ?, ai_experience = ?,
        interest_areas = ?, comments = ?, status = ?
       WHERE id = ?`,
    ).run(
      name.trim(), email.trim(), phone || null, affiliation || null,
      age_group || null, gender || null, purpose || null, ai_experience || null,
      areasJson, comments || null, status || 'pending',
      id,
    );

    const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/submissions/:id]', err);
    return NextResponse.json({ error: '수정 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare('SELECT id FROM submissions WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ error: '신청 내역을 찾을 수 없습니다.' }, { status: 404 });
    }
    db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
    return NextResponse.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('[DELETE /api/submissions/:id]', err);
    return NextResponse.json({ error: '삭제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
