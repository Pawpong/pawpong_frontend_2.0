import { apiClient } from '@/shared/api'
import type { ApiResponseFull, BannerDto, FaqDto, AvailablePetDto } from '@/shared/types'

/** 활성 배너 목록 */
export const getBanners = () =>
  apiClient.get<ApiResponseFull<BannerDto[]>>('/api/home/banners').then((res) => res.data.data)

/** 입양자용 FAQ */
export const getAdopterFaqs = () =>
  apiClient
    .get<ApiResponseFull<FaqDto[]>>('/api/home/faqs', { params: { userType: 'adopter' } })
    .then((res) => res.data.data)

/** 브리더용 FAQ */
export const getBreederFaqs = () =>
  apiClient
    .get<ApiResponseFull<FaqDto[]>>('/api/home/faqs', { params: { userType: 'breeder' } })
    .then((res) => res.data.data)

/** 분양중인 아이들 */
export const getAvailablePets = (limit = 10) =>
  apiClient
    .get<ApiResponseFull<AvailablePetDto[]>>('/api/home/available-pets', { params: { limit } })
    .then((res) => {
      if (!res.data.success || !res.data.data) throw new Error('Failed to fetch available pets')
      return res.data.data
    })
