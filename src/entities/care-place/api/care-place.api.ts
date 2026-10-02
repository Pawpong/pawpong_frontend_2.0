import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import type { CarePlacePage, CarePlaceSearch } from '../model/types'

const publicRequest: ApiRequestConfig = { skipAuth: true, skipAuthRefresh: true }

export async function getCareMapConfig(signal?: AbortSignal) {
  return unwrap(
    await apiClient.get<ApiResponse<{ javascriptKey: string }>>(`${API_VERSION}/care-map/config`, {
      ...publicRequest,
      signal,
    }),
  )
}

export async function searchCarePlaces(
  search: CarePlaceSearch,
  page: number,
  signal?: AbortSignal,
) {
  return unwrap(
    await apiClient.get<ApiResponse<CarePlacePage>>(`${API_VERSION}/care-map/places`, {
      ...publicRequest,
      params: { ...search, page },
      signal,
    }),
  )
}
