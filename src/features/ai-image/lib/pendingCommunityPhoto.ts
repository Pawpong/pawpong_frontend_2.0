import type { CommunityAiComparison } from '@/shared/types'
import type { AuthReadSession } from '@/shared/lib/authReadSession'
import { createAuthSessionHandoff } from '@/shared/lib/createAuthSessionHandoff'

export interface PendingCommunityPost {
  files: File[]
  jobId?: string
  aiComparison: CommunityAiComparison | null
}

/** 새 글로 넘기는 한 번짜리 메모리 전달함. 원본은 명시적 비교 공개 선택 때만 포함한다. */
const pending = createAuthSessionHandoff<PendingCommunityPost>(5 * 60_000)

export const setPendingCommunityPhoto = (
  result: File,
  original: File | undefined,
  jobId: string | undefined,
  session: AuthReadSession | null,
) => {
  if (
    [result, ...(original ? [original] : [])].some(
      (file) => !file.size || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
    )
  )
    throw new Error('공유할 사진을 다시 선택해 주세요.')
  pending.set(
    {
      ...(jobId ? { jobId } : {}),
      files: original ? [result, original] : [result],
      aiComparison: original ? { beforePhotoIndex: 1, afterPhotoIndex: 0 } : null,
    },
    session,
  )
}

export const takePendingCommunityPost = (source?: string): PendingCommunityPost | null => {
  const post = pending.take()
  return source === 'ai-photo' ? post : null
}
