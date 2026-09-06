/** OAuth 신규 사용자 정보를 여러 온보딩 페이지 사이에서 보존하는 1회성 세션. */
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
