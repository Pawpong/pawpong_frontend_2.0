import type { RegisterTokens } from '@/shared/types'

/**
 * 가입/로그인으로 받은 토큰을 BFF 라우트에 넘겨 쿠키로 심는다 (로그인 상태 전환).
 *
 * 브라우저에서 호출해야 Set-Cookie 가 현재 origin 쿠키로 적용된다.
 * 가입은 완료됐는데 쿠키 저장만 실패할 수 있으므로 성공 여부를 반환해 호출부가 재로그인시킨다.
 */
export const saveAuthTokens = async ({
  accessToken,
  refreshToken,
}: RegisterTokens): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
      credentials: 'include',
    })
    return response.ok
  } catch {
    return false
  }
}
