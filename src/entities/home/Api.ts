import { apiClient, unwrap } from '@/shared/api'
import type { ApiResponseFull, BannerDto, FaqDto, AvailablePetDto } from '@/shared/types'

/** 활성 배너 목록 */
export const getBanners = () =>
  apiClient
    .get<ApiResponseFull<BannerDto[]>>('/api/home/banners')
    .then((res) => unwrap(res, '배너 목록 조회에 실패했습니다.'))

/** 입양자용 FAQ */
export const getAdopterFaqs = () =>
  apiClient
    .get<ApiResponseFull<FaqDto[]>>('/api/home/faqs', { params: { userType: 'adopter' } })
    .then((res) => unwrap(res, '입양자 FAQ 조회에 실패했습니다.'))

/** 브리더용 FAQ */
export const getBreederFaqs = () =>
  apiClient
    .get<ApiResponseFull<FaqDto[]>>('/api/home/faqs', { params: { userType: 'breeder' } })
    .then((res) => unwrap(res, '브리더 FAQ 조회에 실패했습니다.'))

/** 분양중인 아이들 */
export const getAvailablePets = (limit = 10) =>
  apiClient
    .get<ApiResponseFull<AvailablePetDto[]>>('/api/home/available-pets', { params: { limit } })
    .then((res) => unwrap(res, '분양중인 아이들 조회에 실패했습니다.'))
