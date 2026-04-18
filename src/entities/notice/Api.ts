import { apiClient, unwrap } from '@/shared/api'
import type { ApiResponseFull, PaginationResponse, Notice } from '@/shared/types'

/** 공지사항 목록 조회 */
export const getNoticeList = async (page = 1, limit = 10): Promise<PaginationResponse<Notice>> =>
  apiClient
    .get<ApiResponseFull<PaginationResponse<Notice>>>('/api/notice', {
      params: { page, limit },
    })
    .then((res) => unwrap(res, '공지사항 목록 조회에 실패했습니다.'))

/** 공지사항 상세 조회 */
export const getNoticeDetail = async (noticeId: string): Promise<Notice> =>
  apiClient
    .get<ApiResponseFull<Notice>>(`/api/notice/${noticeId}`)
    .then((res) => unwrap(res, '공지사항 상세 조회에 실패했습니다.'))
