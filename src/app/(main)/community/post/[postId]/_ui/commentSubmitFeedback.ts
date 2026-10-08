import { isApiError, AuthWriteRetryRequiredError } from '@/shared/api'
import { CommentIntentError } from './commentThread'

export function commentSubmitFeedback(error: unknown) {
  const needsConsent =
    isApiError(error) && error.status === 403 && error.message.includes('앱 표시 동의')
  if (needsConsent)
    return {
      message: '앱에서 댓글을 남기려면 게시물 표시 동의가 필요해요.',
      needsConsent,
      canCheck: false,
    }
  if (error instanceof AuthWriteRetryRequiredError)
    return {
      message: '로그인 정보를 갱신했어요. 입력한 글을 확인한 뒤 다시 게시해 주세요.',
      needsConsent: false,
      canCheck: false,
    }
  if (error instanceof CommentIntentError)
    return { message: error.message, needsConsent: false, canCheck: true }
  if (isApiError(error) && error.status === 401)
    return {
      message: '로그인이 만료됐어요. 다시 로그인해 주세요.',
      needsConsent: false,
      canCheck: false,
    }
  if (isApiError(error) && error.status && error.status < 500)
    return {
      message:
        '댓글을 등록할 수 없어요. 글이나 답글 대상의 상태를 확인해 주세요. 입력한 글은 유지돼요.',
      needsConsent: false,
      canCheck: true,
    }
  return {
    message:
      '댓글 등록 여부를 확인하지 못했어요. 목록을 확인한 뒤 다시 게시해 주세요. 입력한 글은 유지돼요.',
    needsConsent: false,
    canCheck: true,
  }
}
