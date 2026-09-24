import { beginLogin, beginLogout, waitForAuthCookieWrites } from '@/shared/lib/authSessionLifecycle'
import { notifyAuthStateChanged } from '@/shared/lib/authStateEvents'
import { clearAuthCookies } from '@/shared/lib/authSessionRecovery'
import { unregisterNativePushSession } from '@/shared/lib/nativePushSession'
import {
  deletionErrorMessage,
  deletionResponseSchema,
  type DeletionStatus,
} from '@/shared/lib/accountDeletion'

class DeletionRequestError extends Error {}

// iOS 15 WebView도 지원하도록 AbortSignal.timeout 대신 기본 AbortController를 쓴다.
async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  ms = 20_000,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    return await operation(controller.signal)
  } finally {
    clearTimeout(timeout)
  }
}

export async function getDeletionStatus(signal?: AbortSignal): Promise<DeletionStatus | null> {
  const response = await fetch('/api/account-deletion/status', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(deletionErrorMessage(response.status))
  const result = deletionResponseSchema.safeParse(await response.json())
  if (!result.success) throw new Error(deletionErrorMessage(502))
  return result.data.data
}

/** 접수 전에 push를 해제하고, 서버 계정 폐기 후에는 보호된 logout API 없이 로컬 세션을 정리한다. */
export async function requestAccountDeletion(clearQueries: () => void): Promise<DeletionStatus> {
  try {
    const prepared = await withTimeout((signal) =>
      fetch('/api/account-deletion/prepare', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        signal,
      }),
    )
    if (!prepared.ok) throw new DeletionRequestError(deletionErrorMessage(prepared.status))
    const result = await prepared.json()
    if (result?.success !== true || result?.prepared !== true)
      throw new DeletionRequestError(deletionErrorMessage(502))
  } catch (cause) {
    throw new Error(
      cause instanceof DeletionRequestError ? cause.message : deletionErrorMessage(503),
    )
  }
  beginLogout()
  notifyAuthStateChanged()
  await unregisterNativePushSession()
  await waitForAuthCookieWrites()
  let acceptedStatus: DeletionStatus
  try {
    const response = await withTimeout((signal) =>
      fetch('/api/account-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ confirmation: 'DELETE_PERMANENTLY' }),
        signal,
      }),
    )
    if (!response.ok) throw new DeletionRequestError(deletionErrorMessage(response.status))
    const result = deletionResponseSchema.safeParse(await response.json())
    if (!result.success) throw new DeletionRequestError(deletionErrorMessage(502))
    acceptedStatus = result.data.data
  } catch (cause) {
    // 접수 응답만 유실될 수 있으므로 사전 저장한 영수증으로 먼저 조회한다.
    const recovered = await withTimeout((signal) => getDeletionStatus(signal), 10_000).catch(
      () => null,
    )
    if (!recovered) {
      // 요청 실패 후 현재 세션이 여전히 유효하면 기존 사용 흐름을 이어갈 수 있다.
      beginLogin()
      notifyAuthStateChanged()
      throw new Error(
        cause instanceof DeletionRequestError ? cause.message : deletionErrorMessage(503),
      )
    }
    acceptedStatus = recovered
  }
  // BFF 접수 응답도 쿠키를 만료한다. 응답 유실로 복구된 경우에도 동일하게 정리한다.
  await waitForAuthCookieWrites()
  await clearAuthCookies()
  clearQueries()
  notifyAuthStateChanged()
  return acceptedStatus
}
