'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Submission } from '@/types';

const AGE_GROUPS = ['10대 미만', '10대', '20대', '30대', '40대', '50대', '60대 이상'];
const GENDERS = ['남성', '여성', '기타/응답안함'];
const PURPOSES = ['학습/교육', '업무 활용', '취업/창업', '연구', '기타'];
const AI_EXPERIENCES = [
  '없음',
  '초급 (들어본 정도)',
  '중급 (실제 사용 경험 있음)',
  '고급 (개발/연구 경험 있음)',
];
const INTEREST_AREAS = [
  '머신러닝', '딥러닝', '자연어처리(NLP)', '컴퓨터 비전',
  '데이터 분석', '생성형 AI', '로보틱스', '기타',
];

interface EditForm {
  name: string;
  email: string;
  phone: string;
  affiliation: string;
  age_group: string;
  gender: string;
  purpose: string;
  ai_experience: string;
  interest_areas: string[];
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function EditSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState<EditForm | null>(null);
  const [original, setOriginal] = useState<Submission | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch(`/api/submissions/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: Submission) => {
        setOriginal(data);
        let areas: string[] = [];
        try {
          areas = data.interest_areas ? JSON.parse(data.interest_areas) : [];
        } catch {
          areas = [];
        }
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone ?? '',
          affiliation: data.affiliation ?? '',
          age_group: data.age_group ?? '',
          gender: data.gender ?? '',
          purpose: data.purpose ?? '',
          ai_experience: data.ai_experience ?? '',
          interest_areas: areas,
          comments: data.comments ?? '',
          status: data.status,
        });
      })
      .catch(() => setLoadError('신청 내역을 불러올 수 없습니다.'));
  }, [id]);

  const set = <K extends keyof EditForm>(key: K, value: EditForm[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const toggleInterest = (area: string) => {
    if (!form) return;
    set(
      'interest_areas',
      form.interest_areas.includes(area)
        ? form.interest_areas.filter((a) => a !== area)
        : [...form.interest_areas, area],
    );
  };

  const handleSave = async () => {
    if (!form) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '저장에 실패했습니다.');
        return;
      }
      setOriginal(data);
      setSuccess('변경 사항이 저장되었습니다.');
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`#${id} 신청 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      router.push('/admin/submissions');
    } catch {
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{loadError}</p>
        <Link href="/admin/submissions" className="text-blue-600 hover:underline text-sm">
          신청 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">불러오는 중...</div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm';

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/submissions" className="text-gray-400 hover:text-gray-600 transition">
            ← 목록
          </Link>
          <h1 className="text-xl font-bold text-gray-900">신청 수정 #{id}</h1>
        </div>
        <div className="text-xs text-gray-400">
          {original && `등록: ${formatDate(original.created_at)} · 수정: ${formatDate(original.updated_at)}`}
        </div>
      </div>

      {/* Status badge + changer */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">처리 상태</span>
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <label key={s} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={s}
                checked={form.status === s}
                onChange={() => set('status', s)}
                className="accent-blue-600"
              />
              <span className={`text-sm px-2 py-0.5 rounded-full ${
                s === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                s === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {s === 'pending' ? '대기중' : s === 'approved' ? '승인' : '반려'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 기본 정보 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-4 uppercase tracking-wide">
            기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">이름 *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">이메일 *</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">연락처</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">소속</label>
              <input type="text" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* 인적 사항 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-4 uppercase tracking-wide">
            인적 사항
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">나이대</label>
              <select value={form.age_group} onChange={(e) => set('age_group', e.target.value)}
                className={`${inputClass} bg-white`}>
                <option value="">선택하세요</option>
                {AGE_GROUPS.map((ag) => <option key={ag} value={ag}>{ag}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">성별</label>
              <div className="flex flex-wrap gap-3 pt-1">
                {GENDERS.map((g) => (
                  <label key={g} className="flex items-center gap-1.5 cursor-pointer text-sm">
                    <input type="radio" name="gender" value={g} checked={form.gender === g}
                      onChange={() => set('gender', g)} className="accent-blue-600" />
                    {g}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 설문 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2 mb-4 uppercase tracking-wide">
            설문 항목
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">참가 목적</label>
              <select value={form.purpose} onChange={(e) => set('purpose', e.target.value)}
                className={`${inputClass} bg-white`}>
                <option value="">선택하세요</option>
                {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">AI 활용 경험</label>
              <div className="space-y-1.5">
                {AI_EXPERIENCES.map((exp) => (
                  <label key={exp} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="ai_experience" value={exp}
                      checked={form.ai_experience === exp} onChange={() => set('ai_experience', exp)}
                      className="accent-blue-600" />
                    {exp}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">관심 분야</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INTEREST_AREAS.map((area) => (
                  <label key={area} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition ${
                    form.interest_areas.includes(area)
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}>
                    <input type="checkbox" checked={form.interest_areas.includes(area)}
                      onChange={() => toggleInterest(area)} className="accent-blue-600" />
                    {area}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">추가 의견</label>
              <textarea value={form.comments} onChange={(e) => set('comments', e.target.value)}
                rows={4} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </section>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">{success}</div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition"
        >
          삭제
        </button>
        <div className="flex gap-3">
          <Link href="/admin/submissions"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition">
            취소
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
