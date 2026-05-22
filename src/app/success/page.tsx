import Link from 'next/link';

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h1>
        <p className="text-gray-600 mb-2">참가 신청이 성공적으로 접수되었습니다.</p>
        {searchParams.id && (
          <p className="text-sm text-gray-400 mb-6">접수 번호: #{searchParams.id}</p>
        )}

        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-sm text-blue-700">
          검토 후 이메일로 결과를 안내드릴 예정입니다. 감사합니다.
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          처음으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
