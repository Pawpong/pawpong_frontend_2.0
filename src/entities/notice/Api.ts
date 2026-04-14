import { apiClient } from '@/shared/api'
import type { ApiResponseFull, PaginationResponse, Notice } from '@/shared/types'

/** 공지사항 목록 조회 */
export const getNoticeList = async (page = 1, limit = 10): Promise<PaginationResponse<Notice>> => {
  const response = await apiClient.get<ApiResponseFull<PaginationResponse<Notice>>>('/api/notice', {
    params: { page, limit },
  })
  if (!response.data.success)
    throw new Error(response.data.message || '공지사항 목록 조회에 실패했습니다.')
  return response.data.data
}

/** 공지사항 상세 조회 */
export const getNoticeDetail = async (noticeId: string): Promise<Notice> => {
  const response = await apiClient.get<ApiResponseFull<Notice>>(`/api/notice/${noticeId}`)
  if (!response.data.success)
    throw new Error(response.data.message || '공지사항 상세 조회에 실패했습니다.')
  return response.data.data
}
