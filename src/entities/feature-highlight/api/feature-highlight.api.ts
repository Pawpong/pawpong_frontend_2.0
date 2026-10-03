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
    headers: { 'Cache-Control': 'no-cache' },
  }
  const data = unwrap(
    await apiClient.get<ApiResponse<unknown>>(`${API_VERSION}/home/feature-highlights`, config),
  )
  return parseFeatureHighlightConfig(data)
}
