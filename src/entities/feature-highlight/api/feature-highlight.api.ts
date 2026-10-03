import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import { parseFeatureHighlightConfig } from '../model/policy'
import type { HighlightPlacement } from '../model/types'

export async function getFeatureHighlights(placement: HighlightPlacement, signal?: AbortSignal) {
  const config: ApiRequestConfig = {
    params: { placement },
    signal,
    skipAuth: true,
    skipAuthRefresh: true,
    withCredentials: false,
    // 캐시는 서버의 no-store 응답으로 제어한다. 별도 헤더는 공개 GET의 CORS를 막을 수 있다.
  }
  const data = unwrap(
    await apiClient.get<ApiResponse<unknown>>(`${API_VERSION}/home/feature-highlights`, config),
  )
  return parseFeatureHighlightConfig(data)
}
