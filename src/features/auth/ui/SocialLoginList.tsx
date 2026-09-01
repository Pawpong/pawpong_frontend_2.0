'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { Button } from '@/shared/ui/Button'

/**
 * 소셜 로그인 버튼 목록 (카카오 / 네이버 / 구글)
 *
 * 동작:
 * 1. 버튼 클릭 → 브라우저를 백엔드 OAuth 진입점으로 이동
 *      window.location.href = `${API_BASE}/api/auth/{provider}?returnUrl=...`
 * 2. 백엔드가 소셜 인증 처리 후 프론트로 리다이렉트:
 *      - 기존 회원 → /login/success?accessToken=...&refreshToken=...&returnUrl=...
 *      - 신규 회원 → /signup?tempId=...&provider=...&email=...&name=...&profileImage=...
 *
 * 주의: OAuth 콜백 URL(GOOGLE/KAKAO/NAVER_CALLBACK_URL)이 백엔드 .env 에서
 *       localhost:8080 로 등록돼 있어야 로컬에서 소셜 로그인이 끝까지 완료된다.
 *       (제공사 콘솔에도 동일 콜백이 등록돼 있어야 함)
 *
 * Figma: PC 3414:750712 / Tablet 3414:751419 / Mobile 3414:751420.
 * Figma에 없는 네이버는 같은 FillButton 규격에 공식 브랜드 색을 적용한다.
 */
type SocialProvider = 'kakao' | 'naver' | 'google'

const SOCIAL_BUTTONS: {
  provider: SocialProvider
  label: string
  Icon: typeof KakaoIcon
  className: string
}[] = [
  {
    provider: 'google',
    label: '구글 로그인',
    Icon: GoogleIcon,
    // Figma FillButton(2609:258329)의 neutral 표면. 구글의 밝은 버튼 규격 안에서 유지한다.
    className: 'bg-[#F0F0F0] text-neutral-850 hover:bg-neutral-150 active:bg-neutral-300',
  },
  {
    provider: 'kakao',
    label: '카카오 로그인',
    Icon: KakaoIcon,
    // Figma FillButton(2609:258347)의 브랜드 배경.
    className: 'bg-[#FFE812] text-neutral-850 hover:brightness-[0.98] active:brightness-95',
  },
  {
    provider: 'naver',
    label: '네이버 로그인',
    Icon: NaverIcon,
    className: 'bg-[#03C75A] text-white hover:brightness-[0.98] active:brightness-95',
  },
]

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, '')
  }
  return 'http://localhost:8080'
}

export const SocialLoginList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = normalizeReturnUrl(searchParams.get('returnUrl'))

  const hasAccessToken = () =>
    document.cookie.split(';').some((c) => c.trim().startsWith('accessToken='))

  // 이미 로그인된 상태로 /login 에 진입하면(뒤로가기 등) 즉시 벗어난다 — 로그인 페이지 트랩 방지.
  // replace 로 이동해 /login 이 히스토리에 남지 않게 한다.
  useEffect(() => {
    if (hasAccessToken()) router.replace(returnUrl)
  }, [router, returnUrl])

  // 버튼 클릭 시점에도 한 번 더 확인 (마운트 이후 다른 탭에서 로그인된 경우 등)
  const redirectIfLoggedIn = (): boolean => {
    if (hasAccessToken()) {
      router.replace(returnUrl)
      return true
    }
    return false
  }

  const startSocialLogin = (provider: SocialProvider) => {
    if (redirectIfLoggedIn()) return
    const base = getApiBaseUrl()
    const url =
      returnUrl !== '/'
        ? `${base}/api/auth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`
        : `${base}/api/auth/${provider}`
    // href 할당 대신 assign() 사용 (react-hooks/immutability 규칙 회피, 동작 동일)
    window.location.assign(url)
  }

  return (
    <div className="flex w-full flex-col gap-3 tab:gap-4">
      {SOCIAL_BUTTONS.map(({ provider, label, Icon, className }) => (
        <Button
          key={provider}
          variant="fill"
          className={cn(
            'h-10 w-full gap-0.5 px-4 py-2 transition-[color,background-color,filter] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
            className,
          )}
          onClick={() => startSocialLogin(provider)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  )
}
