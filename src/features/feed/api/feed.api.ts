import { apiClient, API_VERSION, unwrap } from '@/shared/api'

/** 비디오 좋아요 토글 */
export const toggleVideoLike = (videoId: string) =>
  apiClient
    .post<{
      success: boolean
      data: { videoId: string; isLiked: boolean; likeCount: number }
    }>(`${API_VERSION}/feed/like/${videoId}`)
    .then((res) => unwrap(res, '좋아요 처리에 실패했습니다.'))

/** 댓글 작성 */
export const createVideoComment = (videoId: string, content: string) =>
  apiClient.post(`${API_VERSION}/feed/comment/${videoId}`, { content }).then((res) => res.data)
