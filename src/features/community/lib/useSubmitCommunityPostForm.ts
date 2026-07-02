'use client'

import { useCallback, useState } from 'react'
import { useUploadMultipleFiles } from '@/features/upload'
import type { CommunityPostStatus, CommunityPostVisibility } from '@/shared/types'
import { useCreateCommunityPost } from '../api/community.mutations'

interface SubmitPostFormInput {
  text: string
  files: File[]
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
}

/** 게시글 이미지가 업로드되는 스토리지 폴더 */
const COMMUNITY_UPLOAD_FOLDER = 'community'

/**
 * 글 작성 폼(본문 + 이미지 + 공개범위) 을 백엔드 계약에 맞춰 제출한다.
 *
 * 1) 이미지 File[] 을 upload 모듈로 먼저 업로드해 fileName[] 을 확보하고
 * 2) createCommunityPost 로 게시글(발행/임시저장) 을 생성한다.
 *
 * 발행(published)/임시저장(draft) 은 status 로 구분하며, 성공 시 생성된 postId 를 반환한다.
 */
export const useSubmitCommunityPostForm = () => {
  const uploadMutation = useUploadMultipleFiles()
  const createMutation = useCreateCommunityPost()
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = uploadMutation.isPending || createMutation.isPending

  const submit = useCallback(
    async ({ text, files, visibility, status }: SubmitPostFormInput): Promise<string | null> => {
      setError(null)
      try {
        // 1) 첨부 이미지 업로드 → 파일명 확보 (없으면 스킵)
        const photos =
          files.length > 0
            ? (await uploadMutation.mutateAsync({ files, folder: COMMUNITY_UPLOAD_FOLDER })).map(
                (uploaded) => uploaded.fileName,
              )
            : []

        // 2) 게시글 생성 (발행 or 임시저장)
        const trimmed = text.trim()
        const post = await createMutation.mutateAsync({
          body: trimmed.length > 0 ? trimmed : undefined,
          photos,
          visibility,
          status,
        })
        return post.postId
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        setError(message)
        return null
      }
    },
    [uploadMutation, createMutation],
  )

  return { submit, isSubmitting, error }
}
