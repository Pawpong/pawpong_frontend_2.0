/**
 * 소셜 신규가입 세션 (sessionStorage)
 *
 * 백엔드 OAuth 콜백은 신규 소셜 사용자를 `/signup?tempId=...&provider=...&email=...&name=...`
 * 로 보낸다. 그런데 회원가입은 여러 페이지(/signup → /signup/[type]/[step]...)를 거치며
 * URL 쿼리가 사라지므로, 첫 진입 시 이 값들을 sessionStorage 에 저장해 마지막
 * social/complete 호출 때까지 보존한다.
 *
 * 주의: tempId 는 백엔드의 pending 소셜 등록과 연결된 1회성 값이다. 가입 완료 후 clear 한다.
 */
const KEY = 'pawpong:social-signup'

export interface SocialSignupSession {
  tempId: string
  provider: string
  email: string
  name: string
  profileImage?: string
}

export const saveSocialSignupSession = (data: SocialSignupSession): void => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export const loadSocialSignupSession = (): SocialSignupSession | null => {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SocialSignupSession
  } catch {
    return null
  }
}

export const clearSocialSignupSession = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(KEY)
}
