import { Suspense } from 'react'
import Link from 'next/link'
import { SocialLoginList } from '@/features/auth'

/**
 * 로그인 페이지 (와이어프레임)
 *
 * ⚠️ 디자인 미확정 상태. 레이아웃/스타일은 임시이며, 소셜 로그인 "연결 동작" 검증이 목적이다.
 *
 * 흐름:
 *   [이 페이지] 소셜 버튼 클릭
 *     → 백엔드 OAuth (/api/auth/{provider})
 *       → 기존 회원: /login/success (토큰 쿠키 저장 후 홈)
 *       → 신규 회원: /signup?tempId=... (회원가입 완료 플로우)
 *
 * TODO(FE): 디자인 확정 시 헤더/로고/약관 동의/배너(login-banners) 영역 추가.
 */
const LoginPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-8 px-5">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Pawpong 로그인</h1>
        <p className="mt-2 text-sm text-[#6b6b6b]">소셜 계정으로 간편하게 시작하세요</p>
      </header>

      {/* SocialLoginList 는 useSearchParams(returnUrl) 를 쓰므로 Suspense 로 감싼다 (Next 16 요구사항) */}
      <Suspense fallback={<div className="h-40" />}>
        <SocialLoginList />
      </Suspense>

      <p className="text-center text-sm text-[#6b6b6b]">
        아직 회원이 아니신가요?{' '}
        <Link href="/signup" className="font-semibold underline">
          회원가입
        </Link>
      </p>
    </main>
  )
}

export default LoginPage
