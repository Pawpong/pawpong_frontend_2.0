import {
  reviewLoginErrorMessage,
  reviewLoginResponseSchema,
  type ReviewLoginCredentials,
} from '@/shared/lib/reviewLogin'
import { beginLogin, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { saveAuthTokens } from '@/shared/lib/saveAuthTokens'

export async function signInReviewAccount(
  credentials: ReviewLoginCredentials,
  signal: AbortSignal,
): Promise<boolean> {
  const generation = beginLogin()
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
    if (signal.aborted || !isAuthSessionCurrent(generation)) return false
    throw new Error(reviewLoginErrorMessage(503))
  }
  if (signal.aborted || !isAuthSessionCurrent(generation)) return false
  if (!response.ok) throw new Error(reviewLoginErrorMessage(response.status))

  const parsed = reviewLoginResponseSchema.safeParse(await response.json().catch(() => null))
  if (signal.aborted || !isAuthSessionCurrent(generation)) return false
  if (!parsed.success) throw new Error(reviewLoginErrorMessage(502))

  // 응답 토큰은 기존 BFF 쿠키 저장에만 전달한다. URL·Web Storage에는 저장하지 않는다.
  return saveAuthTokens(parsed.data.data)
}
