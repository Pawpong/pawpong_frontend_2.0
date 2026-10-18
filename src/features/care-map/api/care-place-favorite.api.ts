import { apiClient, API_VERSION, unwrapVoid } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'
import type { CarePlace } from '@/entities/care-place'
import { toCarePlaceFavoriteSnapshot } from '../lib/care-place-favorite'

/** 시설 즐겨찾기 — 이미 저장한 시설이면 시설 정보만 갱신된다 */
export const addCarePlaceFavorite = async (place: CarePlace): Promise<void> => {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `${API_VERSION}/care-map/favorites`,
    toCarePlaceFavoriteSnapshot(place),
  )
  unwrapVoid(response, '즐겨찾기에 저장하지 못했어요.')
}

/** 시설 즐겨찾기 취소 (저장하지 않은 시설이어도 성공) */
export const removeCarePlaceFavorite = async (placeId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    `${API_VERSION}/care-map/favorites/${encodeURIComponent(placeId)}`,
  )
  unwrapVoid(response, '즐겨찾기를 취소하지 못했어요.')
}
