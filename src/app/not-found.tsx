import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-primary-500 mb-4 text-4xl font-bold">404</h1>
      <p className="text-body-m text-grayscale-gray5 mb-6">페이지를 찾을 수 없습니다</p>
      <Link
        href="/"
        className="bg-primary rounded-lg px-6 py-3 text-white transition-opacity hover:opacity-90"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
