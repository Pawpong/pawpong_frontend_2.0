import { apiClient, API_VERSION, unwrap } from '@/shared/api'
// [refactored] inline 응답 타입 제거 → 표준 ApiResponseFull 타입 import
import type {
  ApiResponseFull,
  AllFilterOptions,
  SortOption,
  DogSizeOption,
  CatFurLengthOption,
  AdoptionStatusOption,
} from '@/shared/types'

// [refactored] { success, data, message? } inline 6회 반복 → ApiResponseFull<T>로 통일

/** 전체 필터 옵션 조회 */
export const getAllFilterOptions = () =>
  apiClient.get<ApiResponseFull<AllFilterOptions>>(`${API_VERSION}/filter-options`).then(unwrap)

/** 정렬 옵션 조회 */
export const getSortOptions = () =>
  apiClient
    .get<ApiResponseFull<SortOption[]>>(`${API_VERSION}/filter-options/sort-options`)
    .then(unwrap)

/** 강아지 크기 옵션 조회 */
export const getDogSizes = () =>
  apiClient
    .get<ApiResponseFull<DogSizeOption[]>>(`${API_VERSION}/filter-options/dog-sizes`)
    .then(unwrap)

/** 고양이 털 길이 옵션 조회 */
export const getCatFurLengths = () =>
  apiClient
    .get<ApiResponseFull<CatFurLengthOption[]>>(`${API_VERSION}/filter-options/cat-fur-lengths`)
    .then(unwrap)

/** 입양 가능 여부 옵션 조회 */
export const getAdoptionStatus = () =>
  apiClient
    .get<ApiResponseFull<AdoptionStatusOption[]>>(`${API_VERSION}/filter-options/adoption-status`)
    .then(unwrap)
