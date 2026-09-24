import {
  reviewLoginErrorMessage,
  reviewLoginResponseSchema,
  type ReviewLoginCredentials,
} from '@/shared/lib/reviewLogin'
import { getAuthSessionGeneration } from '@/shared/lib/authSessionLifecycle'
import { saveAuthTokens } from '@/shared/lib/saveAuthTokens'

let reviewLoginAttempt = 0

export async function signInReviewAccount(
  credentials: ReviewLoginCredentials,
  signal: AbortSignal,
): Promise<boolean> {
  // 실패한 로그인 시도는 오프라인 로그아웃 의도를 해제하지 않는다.
  // 인증 성공 후 saveAuthTokens가 새 세션을 연다.
  const generation = getAuthSessionGeneration()
  const attempt = ++reviewLoginAttempt
  const isCurrentAttempt = () =>
    !signal.aborted && generation === getAuthSessionGeneration() && attempt === reviewLoginAttempt
  let response: Response
  try {
    response = await fetch('/api/auth/review-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
    })
  } catch {
    if (!isCurrentAttempt()) return false
    throw new Error(reviewLoginErrorMessage(503))
  }
  if (!isCurrentAttempt()) return false
  if (!response.ok) throw new Error(reviewLoginErrorMessage(response.status))

  const parsed = reviewLoginResponseSchema.safeParse(await response.json().catch(() => null))
  if (!isCurrentAttempt()) return false
  if (!parsed.success) throw new Error(reviewLoginErrorMessage(502))

  // 응답 토큰은 기존 BFF 쿠키 저장에만 전달한다. URL·Web Storage에는 저장하지 않는다.
  return saveAuthTokens(parsed.data.data)
}
