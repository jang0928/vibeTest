'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  '머신러닝',
  '딥러닝',
  '자연어처리(NLP)',
  '컴퓨터 비전',
  '데이터 분석',
  '생성형 AI',
  '로보틱스',
  '기타',
];

interface FormData {
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
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function SurveyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    affiliation: '',
    age_group: '',
    gender: '',
    purpose: '',
    ai_experience: '',
    interest_areas: [],
    comments: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const toggleInterest = (area: string) =>
    set(
      'interest_areas',
      formData.interest_areas.includes(area)
        ? formData.interest_areas.filter((a) => a !== area)
        : [...formData.interest_areas, area],
    );

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = '이름을 입력해주세요.';
    if (!formData.email.trim()) {
      errs.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = '유효한 이메일 주소를 입력해주세요.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || '신청 중 오류가 발생했습니다.');
        return;
      }
      router.push(`/success?id=${data.id}`);
    } catch {
      setSubmitError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI 워크샵 참가 신청</h1>
          <p className="mt-2 text-gray-600">아래 양식을 작성하여 참가 신청을 완료해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* 기본 정보 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              기본 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="홍길동"
                  className={inputClass('name')}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="example@email.com"
                  className={inputClass('email')}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="010-0000-0000"
                  className={inputClass('phone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소속</label>
                <input
                  type="text"
                  value={formData.affiliation}
                  onChange={(e) => set('affiliation', e.target.value)}
                  placeholder="회사명 또는 학교명"
                  className={inputClass('affiliation')}
                />
              </div>
            </div>
          </section>

          {/* 인적 사항 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              인적 사항
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">나이대</label>
                <select
                  value={formData.age_group}
                  onChange={(e) => set('age_group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">선택하세요</option>
                  {AGE_GROUPS.map((ag) => (
                    <option key={ag} value={ag}>{ag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {GENDERS.map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={formData.gender === g}
                        onChange={(e) => set('gender', e.target.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 설문 항목 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              설문 항목
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">참가 목적</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => set('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">선택하세요</option>
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI 활용 경험</label>
                <div className="space-y-2">
                  {AI_EXPERIENCES.map((exp) => (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ai_experience"
                        value={exp}
                        checked={formData.ai_experience === exp}
                        onChange={(e) => set('ai_experience', e.target.value)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관심 분야 <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {INTEREST_AREAS.map((area) => (
                    <label
                      key={area}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition ${
                        formData.interest_areas.includes(area)
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.interest_areas.includes(area)}
                        onChange={() => toggleInterest(area)}
                        className="accent-blue-600 rounded"
                      />
                      <span className="text-sm">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 추가 의견 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              추가 의견
            </h2>
            <textarea
              value={formData.comments}
              onChange={(e) => set('comments', e.target.value)}
              placeholder="기타 문의사항이나 요청사항을 자유롭게 작성해주세요."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </section>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
          >
            {isSubmitting ? '처리 중...' : '참가 신청하기'}
          </button>

          <p className="text-center text-xs text-gray-400">
            <span className="text-red-400">*</span> 표시는 필수 입력 항목입니다.
          </p>
        </form>
      </div>
    </main>
  );
}
