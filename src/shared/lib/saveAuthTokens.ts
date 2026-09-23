import type { RegisterTokens } from '@/shared/types'
import { getAccessToken } from '@/shared/api/token'
import {
  beginLogin,
  isAuthSessionCurrent,
  trackAuthCookieWrite,
  waitForAuthCookieWrites,
} from './authSessionLifecycle'
import { notifyAuthStateChanged } from './authStateEvents'

/** 가입 결과 토큰을 BFF에 전달해 현재 origin의 인증 쿠키로 저장한다. */
export const saveAuthTokens = async ({
  accessToken,
  refreshToken,
}: RegisterTokens): Promise<boolean> => {
  if (!accessToken || !refreshToken) return false
  const generation = beginLogin()
  try {
    await waitForAuthCookieWrites()
    if (!isAuthSessionCurrent(generation)) return false
    const response = await trackAuthCookieWrite(
      fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
        credentials: 'include',
      }),
    )
    if (!isAuthSessionCurrent(generation) || !response.ok || getAccessToken() !== accessToken)
      return false
    notifyAuthStateChanged()
    return true
  } catch {
    return false
  }
}
