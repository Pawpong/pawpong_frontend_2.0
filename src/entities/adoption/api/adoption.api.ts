import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  AdoptionPetCard,
  AdoptionPetDetail,
  AdoptionListParams,
  AdoptionPopularParams,
  AdoptionFavoritesParams,
  AdoptionAdoptedParams,
  AdoptedPetCard,
} from '@/shared/types'

/** 입양 동물 목록 조회 */
export const getAdoptionList = async (
  params: AdoptionListParams = {},
): Promise<PaginationResponse<AdoptionPetCard>> => {
  const query = new URLSearchParams()
  if (params.petType) query.set('petType', params.petType)
  if (params.breederId) query.set('breederId', params.breederId)
  if (params.excludePetId) query.set('excludePetId', params.excludePetId)
  if (params.status) query.set('status', params.status)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<AdoptionPetCard>>>(
    `${API_VERSION}/adoption?${query.toString()}`,
  )
  return unwrap(response, '입양 동물 목록 조회에 실패했습니다.')
}

/** 인기 입양 동물 조회 */
export const getPopularAdoptions = async (
  params: AdoptionPopularParams = {},
): Promise<AdoptionPetCard[]> => {
  const query = new URLSearchParams()
  if (params.petType) query.set('petType', params.petType)
  if (params.limit) query.set('limit', String(params.limit))

  const response = await apiClient.get<ApiResponseFull<AdoptionPetCard[]>>(
    `${API_VERSION}/adoption/popular?${query.toString()}`,
  )
  return unwrap(response, '인기 입양 동물 조회에 실패했습니다.')
}

/** 입양 동물 상세 조회 */
export const getAdoptionDetail = async (petId: string): Promise<AdoptionPetDetail> => {
  const response = await apiClient.get<ApiResponseFull<AdoptionPetDetail>>(
    `${API_VERSION}/adoption/${petId}`,
  )
  return unwrap(response, '입양 동물 상세 조회에 실패했습니다.')
}

/** 입양 관심 목록 조회 */
export const getMyFavoriteAdoptions = async (
  params: AdoptionFavoritesParams = {},
): Promise<PaginationResponse<AdoptionPetCard>> => {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<AdoptionPetCard>>>(
    `${API_VERSION}/adoption/me/favorites?${query.toString()}`,
  )
  return unwrap(response, '관심 목록 조회에 실패했습니다.')
}

/** 내가 입양한 목록 조회 */
export const getMyAdoptedPets = async (
  params: AdoptionAdoptedParams = {},
): Promise<PaginationResponse<AdoptedPetCard>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<AdoptedPetCard>>>(
    `${API_VERSION}/adoption/me/adopted?${query.toString()}`,
  )
  return unwrap(response, '입양 완료 목록 조회에 실패했습니다.')
}
