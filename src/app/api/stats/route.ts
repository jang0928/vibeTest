import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    const total = (
      db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number }
    ).count;

    const byStatus = db
      .prepare("SELECT COALESCE(status,'미응답') as status, COUNT(*) as count FROM submissions GROUP BY status")
      .all();

    const byGender = db
      .prepare("SELECT COALESCE(gender,'미응답') as gender, COUNT(*) as count FROM submissions GROUP BY gender ORDER BY count DESC")
      .all();

    const byAgeGroup = db
      .prepare("SELECT COALESCE(age_group,'미응답') as age_group, COUNT(*) as count FROM submissions GROUP BY age_group ORDER BY age_group")
      .all();

    const byPurpose = db
      .prepare("SELECT COALESCE(purpose,'미응답') as purpose, COUNT(*) as count FROM submissions GROUP BY purpose ORDER BY count DESC")
      .all();

    const byAiExperience = db
      .prepare("SELECT COALESCE(ai_experience,'미응답') as ai_experience, COUNT(*) as count FROM submissions GROUP BY ai_experience ORDER BY count DESC")
      .all();

    const recentSubmissions = db
      .prepare('SELECT * FROM submissions ORDER BY created_at DESC LIMIT 5')
      .all();

    return NextResponse.json({
      total,
      by_status: byStatus,
      by_gender: byGender,
      by_age_group: byAgeGroup,
      by_purpose: byPurpose,
      by_ai_experience: byAiExperience,
      recent_submissions: recentSubmissions,
    });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: '통계 데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
