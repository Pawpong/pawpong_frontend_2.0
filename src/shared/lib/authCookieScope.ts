import { getAccessToken } from '@/shared/api/token'
import { ApiError } from '@/shared/api/unwrap'
import { getAuthSessionGeneration } from './authSessionLifecycle'
import { authTokenIdentity } from './authTokenIdentity'

export type AuthCookieScope = { generation: number; identity: string | null }

export class AuthCookieSessionChangedError extends ApiError {
  constructor() {
    super('인증 세션이 변경되었습니다.', 401)
    this.name = 'AuthCookieSessionChangedError'
  }
}

export const captureAuthCookieScope = (): AuthCookieScope => ({
  generation: getAuthSessionGeneration(),
  identity: authTokenIdentity(getAccessToken()),
})

/** 로그아웃 중에도 검증하며 탈퇴 BFF가 이미 지운 쿠키만 선택적으로 허용한다. */
export function isAuthCookieScopeCurrent(scope: AuthCookieScope, allowMissingToken = false) {
  const identity = authTokenIdentity(getAccessToken())
  return (
    scope.generation === getAuthSessionGeneration() &&
    (identity === scope.identity || (allowMissingToken && identity === null))
  )
}

export function assertAuthCookieScopeCurrent(scope: AuthCookieScope, allowMissingToken = false) {
  if (!isAuthCookieScopeCurrent(scope, allowMissingToken))
    throw new AuthCookieSessionChangedError()
}
