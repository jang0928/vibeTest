import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 워크샵 참가 신청',
  description: 'AI 워크샵 참가 신청 및 관리 시스템',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
