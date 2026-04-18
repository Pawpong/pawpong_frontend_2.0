import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold text-primary-500 mb-4">404</h1>
      <p className="text-body-m text-grayscale-gray5 mb-6">페이지를 찾을 수 없습니다</p>
      <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
