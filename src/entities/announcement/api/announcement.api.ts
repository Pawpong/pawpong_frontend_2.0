import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, PaginationResponse, Announcement } from '@/shared/types'

/** 활성 공지 목록 조회 */
export const getActiveAnnouncements = async (
  page = 1,
  limit = 10,
): Promise<PaginationResponse<Announcement>> =>
  apiClient
    .get<ApiResponseFull<PaginationResponse<Announcement>>>(`${API_VERSION}/announcement/list`, {
      params: { page, limit },
    })
    .then((res) => unwrap(res, '공지 목록 조회에 실패했습니다.'))

/** 공지 단건 조회 */
export const getAnnouncementById = async (announcementId: string): Promise<Announcement> =>
  apiClient
    .get<ApiResponseFull<Announcement>>(`${API_VERSION}/announcement/${announcementId}`)
    .then((res) => unwrap(res, '공지 조회에 실패했습니다.'))
