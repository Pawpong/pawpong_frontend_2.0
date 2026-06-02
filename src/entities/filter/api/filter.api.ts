import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  AllFilterOptions,
  BreederLevelOption,
  SortOption,
  DogSizeOption,
  CatFurLengthOption,
  AdoptionStatusOption,
} from '@/shared/types'

/** 전체 필터 옵션 조회 */
export const getAllFilterOptions = () =>
  apiClient
    .get<{
      success: boolean
      data: AllFilterOptions
      message?: string
    }>(`${API_VERSION}/filter-options`)
    .then(unwrap)

/** 브리더 레벨 옵션 조회 */
export const getBreederLevels = () =>
  apiClient
    .get<{
      success: boolean
      data: BreederLevelOption[]
      message?: string
    }>(`${API_VERSION}/filter-options/breeder-levels`)
    .then(unwrap)

/** 정렬 옵션 조회 */
export const getSortOptions = () =>
  apiClient
    .get<{
      success: boolean
      data: SortOption[]
      message?: string
    }>(`${API_VERSION}/filter-options/sort-options`)
    .then(unwrap)

/** 강아지 크기 옵션 조회 */
export const getDogSizes = () =>
  apiClient
    .get<{
      success: boolean
      data: DogSizeOption[]
      message?: string
    }>(`${API_VERSION}/filter-options/dog-sizes`)
    .then(unwrap)

/** 고양이 털 길이 옵션 조회 */
export const getCatFurLengths = () =>
  apiClient
    .get<{
      success: boolean
      data: CatFurLengthOption[]
      message?: string
    }>(`${API_VERSION}/filter-options/cat-fur-lengths`)
    .then(unwrap)

/** 입양 가능 여부 옵션 조회 */
export const getAdoptionStatus = () =>
  apiClient
    .get<{
      success: boolean
      data: AdoptionStatusOption[]
      message?: string
    }>(`${API_VERSION}/filter-options/adoption-status`)
    .then(unwrap)
