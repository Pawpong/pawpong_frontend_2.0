import { Suspense } from 'react'
import Link from 'next/link'
import {
  isSocialProvider,
  ReactivateAccountPrompt,
  SocialLoginList,
  SocialProviderPrompt,
} from '@/features/auth'
import { AlertMessage } from '@/shared/ui'
import { CheckRoundedIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { LogoButton } from '@/widgets/gnb'

/**
 * 소셜 로그인 페이지.
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
 * ?type=deleted_account 로 들어오면 탈퇴 계정으로 소셜 로그인한 경우다.
 *   - reactivationToken 이 함께 오면 → 복구 확인 모달 (ReactivateAccountPrompt)
 *   - 없으면(정지 계정 등 복구 불가) → error 사유만 안내
 *
 * ?error= 는 백엔드 콜백이 로그인을 막은 사유다. 탈퇴 계정 외의 사유(다른 소셜로 가입된
 * 이메일 등)는 지금까지 화면에 아무것도 뜨지 않아, 사용자는 왜 안 되는지 알 수 없었다.
 *
 * Figma: PC 3414:750712 / Tablet 3414:751419 / Mobile 3414:751420
 * 원본의 이메일·비밀번호 안내와 별도 회원가입 링크는 현재 소셜 전용 인증 계약에 맞게
 * 소셜 로그인 및 신규 사용자 온보딩 안내로 치환한다.
 */
const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    signup?: string
    returnUrl?: string
    error?: string
    type?: string
    provider?: string
  }>
}) => {
  const { signup, returnUrl: requestedReturnUrl, error, type, provider } = await searchParams
  const returnUrl = normalizeReturnUrl(requestedReturnUrl)
  // 탈퇴 계정은 ReactivateAccountPrompt 가 복구 모달로, 다른 소셜로 가입된 계정은
  // SocialProviderPrompt 가 그 제공자로 보내는 모달로 따로 안내한다.
  // 모르는 provider 는 모달이 뜨지 않으므로, 사유가 사라지지 않게 인라인으로 남긴다.
  const handledByModal = type === 'deleted_account' || isSocialProvider(provider)
  const loginError = handledByModal ? undefined : error
  const reviewHref =
    returnUrl === '/' ? '/login/review' : `/login/review?returnUrl=${encodeURIComponent(returnUrl)}`

  return (
    <div className="flex min-h-dvh flex-col bg-base-white">
      <header className="h-12 shrink-0 bg-white pc:h-16">
        <div className="page-shell flex h-full items-center">
          <LogoButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <header className="flex flex-col items-center justify-center gap-0.5 px-4 py-8 text-center tab:px-20 tab:py-12">
          <h1
            className={cn(
              cafe24Proup.className,
              'font-cafe24 text-sm leading-[1.5] font-normal text-neutral-850 tab:text-xl',
            )}
          >
            로그인
          </h1>
          <p className="text-sm leading-[1.5] font-semibold text-neutral-700 tab:text-xl">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </header>

        <section
          aria-label="소셜 로그인"
          className="flex flex-1 justify-center px-4 pt-4 pb-12 tab:px-20 tab:pt-7"
        >
          <div className="flex w-full max-w-[31.25rem] flex-col gap-4">
            {signup === 'completed' && (
              <AlertMessage
                status="info"
                size="responsive"
                icon={CheckRoundedIcon}
                message="회원가입이 완료됐어요. 로그인만 다시 진행해주세요."
                className="justify-center"
              />
            )}

            {loginError && (
              <div role="alert">
                <AlertMessage status="error" size="responsive" message={loginError} />
              </div>
            )}

            {/* 탈퇴 계정 복구 안내 — useSearchParams 를 쓰므로 Suspense 필요 (Next 16) */}
            <Suspense fallback={null}>
              <ReactivateAccountPrompt />
            </Suspense>

            {/* 다른 소셜로 가입된 계정 — 그 제공자로 바로 보내는 모달 */}
            <Suspense fallback={null}>
              <SocialProviderPrompt />
            </Suspense>

            {/* SocialLoginList 는 useSearchParams(returnUrl) 를 쓰므로 Suspense 로 감싼다 (Next 16 요구사항) */}
            <Suspense fallback={<SocialLoginFallback />}>
              <SocialLoginList />
            </Suspense>

            <p className="mt-3 text-center text-sm leading-[1.5] font-medium text-neutral-700 tab:text-base">
              처음이신가요? 소셜 로그인 후 회원가입이 이어져요.
            </p>
            <Link
              href={reviewHref}
              className="mx-auto rounded px-2 py-2 text-xs text-neutral-700 underline underline-offset-4 focus-ring hover:text-neutral-850"
            >
              심사용 계정 로그인
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

const SocialLoginFallback = () => (
  <div className="flex w-full flex-col gap-3 tab:gap-4" aria-hidden="true">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="h-10 w-full animate-pulse rounded-lg bg-neutral-100" />
    ))}
  </div>
)

export default LoginPage
