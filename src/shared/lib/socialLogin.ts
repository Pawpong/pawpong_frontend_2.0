import { getApiBaseUrl as getConfiguredApiBaseUrl } from '@/shared/config'

export type SocialProvider = 'kakao' | 'naver' | 'google' | 'apple'

/** 버튼과 안내 문구가 같은 이름을 쓰도록 한 곳에 둔다 */
export const SOCIAL_PROVIDER_LABEL: Record<SocialProvider, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
  apple: 'Apple',
}

export const isSocialProvider = (value: string | null | undefined): value is SocialProvider =>
  value === 'kakao' || value === 'naver' || value === 'google' || value === 'apple'
/**
 * 백엔드 OAuth 진입 주소.
 *
 * 소셜 버튼과 "이미 가입된 제공자로 로그인" 안내가 같은 주소로 들어가야,
 * 한쪽만 고쳤을 때 둘이 어긋나지 않는다.
 */
export const socialLoginUrl = (provider: SocialProvider, returnUrl: string): string => {
  const base = getConfiguredApiBaseUrl() || 'http://localhost:8080'
  return returnUrl !== '/'
    ? `${base}/api/auth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`
    : `${base}/api/auth/${provider}`
}
