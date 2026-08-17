import { Suspense } from 'react'
import { SocialLoginList } from '@/features/auth'
import { AlertMessage } from '@/shared/ui'
import { CheckRoundedIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'

/**
 * 로그인 페이지 (와이어프레임)
 *
 * ⚠️ 디자인 미확정 상태. 레이아웃/스타일은 임시이며, 소셜 로그인 "연결 동작" 검증이 목적이다.
 *
 * 흐름:
 *   [이 페이지] 소셜 버튼 클릭
 *     → 백엔드 OAuth (/api/auth/{provider})
 *       → 기존 회원: /login/success (토큰 쿠키 저장 후 홈)
 *       → 신규 회원: /signup?tempId=... (회원가입 완료 플로우 — 유형 선택부터)
 *
 * 소셜 전용 서비스라 로그인 = 회원가입 진입점이 동일하다(별도 이메일/비밀번호 가입 없음).
 * GNB/모바일 메뉴의 "회원가입" 버튼도 이 페이지로 들어온다.
 *
 * ?signup=completed 로 들어오면 "가입은 끝났는데 토큰 쿠키 저장만 실패한" 경우다.
 *   (온보딩 마지막 단계의 saveAuthTokens 가 false 를 반환하면 여기로 보낸다)
 *
 * TODO(FE): 디자인 확정 시 헤더/로고/약관 동의/배너(login-banners) 영역 추가.
 */
const LoginPage = async ({ searchParams }: { searchParams: Promise<{ signup?: string }> }) => {
  const { signup } = await searchParams

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center gap-8 px-5">
      {signup === 'completed' && (
        <AlertMessage
          status="info"
          size="responsive"
          icon={CheckRoundedIcon}
          message="회원가입이 완료됐어요. 로그인만 다시 진행해주세요."
          className="justify-center"
        />
      )}

      <header className="text-center">
        {/* cafe24 폰트 — 변수 단독으론 미적용이라 className 병행 */}
        <h1 className={cn(cafe24Proup.className, 'font-cafe24 text-2xl font-bold')}>
          Pawpong 로그인
        </h1>
        <p className="mt-2 text-sm text-neutral-700">소셜 계정으로 간편하게 시작하세요</p>
      </header>

      {/* SocialLoginList 는 useSearchParams(returnUrl) 를 쓰므로 Suspense 로 감싼다 (Next 16 요구사항) */}
      <Suspense fallback={<div className="h-40" />}>
        <SocialLoginList />
      </Suspense>
    </main>
  )
}

export default LoginPage
