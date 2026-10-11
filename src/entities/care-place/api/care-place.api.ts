import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import type {
  CareDirectorySummary,
  CarePlaceFavorite,
  CarePlacePage,
  CarePlaceSearch,
} from '../model/types'

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
  const { region, ...nearby } = search
  const directory = search.scope === 'directory'
  return unwrap(
    await apiClient.get<ApiResponse<CarePlacePage>>(
      `${API_VERSION}/care-map/${directory ? 'directory' : 'places'}`,
      {
        ...publicRequest,
        params: directory
          ? {
              kind: search.kind,
              query: search.query,
              referralOnly: search.referralOnly,
              region,
              page,
            }
          : { ...nearby, page },
        signal,
      },
    ),
  )
}

/** 내 즐겨찾기 (로그인 필요, 최근 저장순) */
export async function getCarePlaceFavorites(signal?: AbortSignal) {
  return unwrap(
    await apiClient.get<ApiResponse<CarePlaceFavorite[]>>(`${API_VERSION}/care-map/favorites`, {
      signal,
    }),
    '즐겨찾기를 불러오지 못했어요.',
  )
}

export async function getCareDirectorySummary(signal?: AbortSignal) {
  return unwrap(
    await apiClient.get<ApiResponse<CareDirectorySummary>>(
      `${API_VERSION}/care-map/directory-summary`,
      {
        ...publicRequest,
        signal,
      },
    ),
  )
}
