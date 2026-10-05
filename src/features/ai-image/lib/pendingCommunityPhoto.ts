import type { CommunityAiComparison } from '@/shared/types'

export interface PendingCommunityPost {
  files: File[]
  jobId?: string
  aiComparison: CommunityAiComparison | null
}

/** 새 글로 넘기는 한 번짜리 메모리 전달함. 원본은 명시적 비교 공개 선택 때만 포함한다. */
let pending: PendingCommunityPost | null = null

export const setPendingCommunityPhoto = (result: File, original?: File, jobId?: string) => {
  pending = {
    ...(jobId ? { jobId } : {}),
    files: original ? [result, original] : [result],
    aiComparison: original ? { beforePhotoIndex: 1, afterPhotoIndex: 0 } : null,
  }
}

export const takePendingCommunityPost = (): PendingCommunityPost | null => {
  const post = pending
  pending = null
  return post
}

/** 기존 결과 사진 전달 호출과 호환한다. */
export const takePendingCommunityPhoto = (): File | null =>
  takePendingCommunityPost()?.files[0] ?? null
