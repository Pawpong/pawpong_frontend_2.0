import type { RegisterTokens } from '@/shared/types'
import { getAccessToken } from '@/shared/api/token'
import {
  beginLogin,
  isAuthSessionCurrent,
  trackAuthCookieWrite,
  waitForAuthCookieWrites,
} from './authSessionLifecycle'
import { notifyAuthStateChanged } from './authStateEvents'
import { withAuthCookieLock } from './authCookieLock'
import { authFetch } from './authFetch'

/**
 * 가입 결과 토큰을 BFF에 전달해 현재 origin의 인증 쿠키로 저장한다.
 * provider 를 주면 BFF 가 로그인 화면 '최근 사용' 표시용 쿠키도 함께 심는다 (BFF 가 값을 검증한다).
 */
export const saveAuthTokens = async ({
  accessToken,
  refreshToken,
  provider,
}: RegisterTokens & { provider?: string | null }): Promise<boolean> => {
  if (!accessToken || !refreshToken) return false
  const generation = beginLogin()
  try {
    await waitForAuthCookieWrites()
    return await withAuthCookieLock(async () => {
      if (!isAuthSessionCurrent(generation)) return false
      const response = await trackAuthCookieWrite(
        authFetch(
          '/api/auth/set-cookie',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, refreshToken, ...(provider && { provider }) }),
          },
          async (response) => response,
        ),
      )
      if (!isAuthSessionCurrent(generation) || !response.ok || getAccessToken() !== accessToken)
        return false
      notifyAuthStateChanged()
      return true
    })
  } catch {
    return false
  }
}
