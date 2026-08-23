'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleIcon, KakaoIcon, NaverIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
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
 * 버튼 디자인은 구 레포(Pawpong/pawpong_frontend components/social-login)에서 가져왔다.
 */
type SocialProvider = 'kakao' | 'naver' | 'google'

const SOCIAL_BUTTONS: {
  provider: SocialProvider
  label: string
  Icon: typeof KakaoIcon
  className: string
}[] = [
  {
    provider: 'kakao',
    label: '카카오로 시작하기',
    Icon: KakaoIcon,
    className: 'bg-[#FEE500] text-neutral-850 hover:bg-[#FEE500]/80',
  },
  {
    provider: 'naver',
    label: '네이버로 시작하기',
    Icon: NaverIcon,
    className: 'bg-[#03C75A] text-white hover:bg-[#03C75A]/80',
  },
  {
    provider: 'google',
    label: '구글로 시작하기',
    Icon: GoogleIcon,
    // 구글은 배경색을 임의로 못 바꾼다 — 공식 가이드라인이 흰색/#131314/#F2F2F2 세 가지만 허용.
    // light 옵션은 #FFFFFF + 1px #747775 테두리가 한 세트라 흰 배경에서도 경계가 보인다.
    className: 'border border-[#747775] bg-white text-neutral-850 hover:bg-neutral-50',
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
  const returnUrl = searchParams.get('returnUrl') || ''

  const hasAccessToken = () =>
    document.cookie.split(';').some((c) => c.trim().startsWith('accessToken='))

  // 이미 로그인된 상태로 /login 에 진입하면(뒤로가기 등) 즉시 벗어난다 — 로그인 페이지 트랩 방지.
  // replace 로 이동해 /login 이 히스토리에 남지 않게 한다.
  useEffect(() => {
    if (hasAccessToken()) router.replace(returnUrl || '/')
  }, [router, returnUrl])

  // 버튼 클릭 시점에도 한 번 더 확인 (마운트 이후 다른 탭에서 로그인된 경우 등)
  const redirectIfLoggedIn = (): boolean => {
    if (hasAccessToken()) {
      router.replace(returnUrl || '/')
      return true
    }
    return false
  }

  const startSocialLogin = (provider: SocialProvider) => {
    if (redirectIfLoggedIn()) return
    const base = getApiBaseUrl()
    const url = returnUrl
      ? `${base}/api/auth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`
      : `${base}/api/auth/${provider}`
    // href 할당 대신 assign() 사용 (react-hooks/immutability 규칙 회피, 동작 동일)
    window.location.assign(url)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {SOCIAL_BUTTONS.map(({ provider, label, Icon, className }) => (
        <Button
          key={provider}
          variant="fill"
          className={cn('h-12 w-full justify-between px-4 py-3', className)}
          onClick={() => startSocialLogin(provider)}
        >
          <Icon className="size-4" />
          {label}
          {/* 아이콘 폭만큼의 여백 — 라벨을 버튼 정중앙에 둔다 */}
          <span className="size-4" />
        </Button>
      ))}
    </div>
  )
}
