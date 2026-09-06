import type { RegisterTokens } from '@/shared/types'
import { getAccessToken } from '@/shared/api/token'
import { notifyAuthStateChanged } from './authStateEvents'

/** 가입 결과 토큰을 BFF에 전달해 현재 origin의 인증 쿠키로 저장한다. */
export const saveAuthTokens = async ({
  accessToken,
  refreshToken,
}: RegisterTokens): Promise<boolean> => {
  if (!accessToken || !refreshToken) return false
  try {
    const response = await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
      credentials: 'include',
    })
    if (!response.ok || getAccessToken() !== accessToken) return false
    notifyAuthStateChanged()
    return true
  } catch {
    return false
  }
}
