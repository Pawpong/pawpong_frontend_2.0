import { AuthWriteRetryRequiredError, isApiError } from '@/shared/api'
import type { CommunityComment } from '@/shared/types'

export interface CommentActionState {
  scope: string
  intent: object
  mode: 'edit' | 'delete'
  comment: CommunityComment
  draft: string
  error?: string
  attempted: boolean
}

export function commentActionFeedback(error: unknown, mode: CommentActionState['mode']) {
  const action = mode === 'edit' ? '저장' : '삭제'
  if (error instanceof AuthWriteRetryRequiredError)
    return `로그인 정보를 갱신했어요. 내용을 확인한 뒤 다시 ${action}해 주세요.`
  if (isApiError(error) && error.status === 401)
    return '로그인이 만료됐어요. 다시 로그인한 뒤 댓글을 확인해 주세요.'
  if (isApiError(error) && error.status && error.status < 500)
    return `댓글을 ${action}할 수 없어요. 현재 댓글과 계정 상태를 확인해 주세요.`
  return `댓글 ${action} 여부를 확인하지 못했어요. 먼저 목록을 다시 확인해 주세요.`
}

export const commentActionTriggerId = (id: string) => `comment-actions-${id}`
