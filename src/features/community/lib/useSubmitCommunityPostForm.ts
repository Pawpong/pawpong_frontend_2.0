'use client'

import { useCallback, useState } from 'react'
import { useUploadMultipleFiles } from '@/features/upload'
import type { CommunityPostStatus, CommunityPostVisibility } from '@/shared/types'
import { useCreateCommunityPost, useUpdateCommunityPost } from '../api/community.mutations'
import { COMMUNITY_UPLOAD_FOLDER, toCommunityPhotoFileName } from './communityPhotoFileName'

interface SubmitPostFormInput {
  text: string
  files: File[]
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  /** 수정 시 그대로 두는 기존 사진 URL (지운 사진은 빠진 상태로 전달) */
  keptImageUrls?: string[]
}

/**
 * 글 작성/수정 폼(본문 + 이미지 + 공개범위) 을 백엔드 계약에 맞춰 제출한다.
 *
 * 1) 새로 고른 이미지 File[] 을 upload 모듈로 먼저 업로드해 fileName[] 을 확보하고
 * 2) postId 가 있으면 updateCommunityPost, 없으면 createCommunityPost 를 호출한다.
 *
 * 발행(published)/임시저장(draft) 은 status 로 구분하며, 성공 시 postId 를 반환한다.
 */
export const useSubmitCommunityPostForm = (postId?: string) => {
  const uploadMutation = useUploadMultipleFiles()
  const createMutation = useCreateCommunityPost()
  const updateMutation = useUpdateCommunityPost(postId ?? '')
  const [error, setError] = useState<string | null>(null)

  const isSubmitting =
    uploadMutation.isPending || createMutation.isPending || updateMutation.isPending

  const submit = useCallback(
    async ({
      text,
      files,
      visibility,
      status,
      keptImageUrls = [],
    }: SubmitPostFormInput): Promise<string | null> => {
      setError(null)
      try {
        // 1) 새로 고른 이미지 업로드 → 파일명 확보 (없으면 스킵)
        const uploaded =
          files.length > 0
            ? (await uploadMutation.mutateAsync({ files, folder: COMMUNITY_UPLOAD_FOLDER })).map(
                (file) => file.fileName,
              )
            : []
        // 남긴 기존 사진 + 새로 올린 사진 (수정에서 사진을 다 지우면 빈 배열로 전송)
        // 하나라도 파일명을 못 뽑으면(예상 밖 URL 형태) 틀린 목록으로 사진을 날리느니
        // photos 를 아예 빼서 서버의 기존 사진을 그대로 둔다.
        const kept = keptImageUrls.map(toCommunityPhotoFileName)
        const resolvedKept = kept.filter((name) => name !== null)
        const photos =
          resolvedKept.length === kept.length ? [...resolvedKept, ...uploaded] : undefined

        // 2) 게시글 생성 or 수정
        // 임시저장은 빈 본문 저장이 정상 값이라 그대로 보낸다(본문 지우고 사진만 남기는 경우).
        // 발행은 서버가 빈 본문을 거부하지만 폼에서 먼저 막는다.
        const body = text.trim()
        const post = postId
          ? await updateMutation.mutateAsync({ body, photos, visibility, status })
          : await createMutation.mutateAsync({ body, photos, visibility, status })
        return post.postId
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '게시글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        setError(message)
        return null
      }
    },
    [postId, uploadMutation, createMutation, updateMutation],
  )

  return { submit, isSubmitting, error }
}
