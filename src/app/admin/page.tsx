'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Stats, Submission, STATUS_LABELS, STATUS_COLORS } from '@/types';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function BarChart({ title, data, valueKey, labelKey }: {
  title: string;
  data: Record<string, unknown>[];
  valueKey: string;
  labelKey: string;
}) {
  const max = Math.max(...data.map((d) => d[valueKey] as number), 1);
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((d, i) => {
          const pct = Math.round(((d[valueKey] as number) / max) * 100);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{String(d[labelKey])}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-6 text-right">{d[valueKey] as number}</span>
            </div>
          );
        })}
        {data.length === 0 && <p className="text-sm text-gray-400 text-center py-4">데이터 없음</p>}
      </div>
    </div>
  );
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError('통계 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statusCount = (s: string) =>
    stats?.by_status.find((x) => x.status === s)?.count ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">데이터 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchStats} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-sm rounded-lg shadow-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          새로고침
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="전체 신청" value={stats?.total ?? 0} color="border-blue-500" />
        <StatCard label="대기중" value={statusCount('pending')} color="border-yellow-400" />
        <StatCard label="승인" value={statusCount('approved')} color="border-green-500" />
        <StatCard label="반려" value={statusCount('rejected')} color="border-red-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BarChart
          title="성별 분포"
          data={(stats?.by_gender ?? []).map((d) => ({ ...d, label: d.gender }))}
          labelKey="label"
          valueKey="count"
        />
        <BarChart
          title="나이대 분포"
          data={(stats?.by_age_group ?? []).map((d) => ({ ...d, label: d.age_group }))}
          labelKey="label"
          valueKey="count"
        />
        <BarChart
          title="참가 목적"
          data={(stats?.by_purpose ?? []).map((d) => ({ ...d, label: d.purpose }))}
          labelKey="label"
          valueKey="count"
        />
        <BarChart
          title="AI 활용 경험"
          data={(stats?.by_ai_experience ?? []).map((d) => ({ ...d, label: d.ai_experience }))}
          labelKey="label"
          valueKey="count"
        />
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">최근 신청 내역</h2>
          <Link href="/admin/submissions" className="text-sm text-blue-600 hover:underline">
            전체 보기 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">이메일</th>
                <th className="px-4 py-3 text-left font-medium">신청일시</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recent_submissions ?? []).map((s: Submission) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{s.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/submissions/${s.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      수정
                    </Link>
                  </td>
                </tr>
              ))}
              {(stats?.recent_submissions ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    신청 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
