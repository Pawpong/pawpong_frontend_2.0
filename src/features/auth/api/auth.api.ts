import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type { ApiResponse, ReactivateAccountResponse } from '@/shared/types'

export const logout = async (): Promise<{ message: string; loggedOutAt: string }> => {
  try {
    // 토큰이 만료돼도 refresh로 세션을 되살리지 않도록 로그아웃 요청은 자동 갱신을 건너뛴다.
    const response = await apiClient.post<ApiResponse<{ message: string; loggedOutAt: string }>>(
      `${API_VERSION}/auth/logout`,
      undefined,
      { skipAuthRefresh: true } as ApiRequestConfig,
    )
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    return unwrap(response, '로그아웃에 실패했습니다.')
  } catch (error) {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
    throw error
  }
}

/**
 * 탈퇴 계정 복구 (재가입이 아니라 기존 계정 되살리기 — 계정 _id 가 유지된다)
 *
 * 소셜 콜백이 /login 쿼리로 넘겨준 reactivationToken(유효 10분) 으로만 호출할 수 있다.
 * - skipAuth: 비로그인 상태에서 부르므로 Authorization 헤더를 싣지 않는다.
 * - skipAuthRefresh: 이 API 의 401 은 인증 실패가 아니라 "복구 토큰이 유효하지 않다"는
 *   도메인 에러다. refresh 를 타면 서버 문구가 '세션이 만료되었습니다' 로 덮이고
 *   쿠키까지 지워지므로 자동 갱신을 건너뛴다.
 */
export const reactivateAccount = async (
  reactivationToken: string,
): Promise<ReactivateAccountResponse> =>
  apiClient
    .post<ApiResponse<ReactivateAccountResponse>>(
      `${API_VERSION}/auth/reactivate`,
      { reactivationToken },
      { skipAuth: true, skipAuthRefresh: true } as ApiRequestConfig,
    )
    .then((res) => unwrap(res, '계정 복구에 실패했습니다.'))
