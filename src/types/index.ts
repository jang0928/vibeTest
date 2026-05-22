export interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  affiliation: string | null;
  age_group: string | null;
  gender: string | null;
  purpose: string | null;
  ai_experience: string | null;
  interest_areas: string | null;
  comments: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StatsEntry {
  label: string;
  count: number;
}

export interface Stats {
  total: number;
  by_status: { status: string; count: number }[];
  by_gender: { gender: string; count: number }[];
  by_age_group: { age_group: string; count: number }[];
  by_purpose: { purpose: string; count: number }[];
  by_ai_experience: { ai_experience: string; count: number }[];
  recent_submissions: Submission[];
}

export const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  approved: '승인',
  rejected: '반려',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
