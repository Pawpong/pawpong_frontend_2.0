'use client'

import { useCallback, useState } from 'react'
import { useUploadMultipleFiles } from '@/features/upload'
import type { CreatePetPostingRequest } from '@/shared/types'
import { useCreatePetPosting } from '../api/pet-posting.mutations'

/** 분양글 이미지가 업로드되는 스토리지 폴더 */
const PET_POSTING_UPLOAD_FOLDER = 'available-pets'

interface SubmitPetPostingInput {
  files: File[]
  representativePhotoIndex: number
  /**
   * 업로드된 사진 파일명 + 정규화된 대표 인덱스를 받아 최종 생성 요청을 만든다.
   * 폼 값 → DTO 매핑은 폼을 소유한 호출측(app 레이어)의 책임 (FSD: feature 는 app 에 의존하지 않음)
   */
  buildRequest: (photos: string[], representativePhotoIndex: number) => CreatePetPostingRequest
}

/**
 * 분양글 작성 제출 흐름 (useSubmitCommunityPostForm 미러)
 * 1) 이미지 File[] 을 upload 모듈로 먼저 업로드해 fileName[] 을 확보하고
 * 2) buildRequest 로 만든 요청을 createPetPosting(POST /api/v2/breeder-pet-posting) 으로 생성한다.
 * 성공 시 생성된 petId 를 반환한다.
 */
export const useSubmitPetPostingForm = () => {
  const uploadMutation = useUploadMultipleFiles()
  const createMutation = useCreatePetPosting()
  const [error, setError] = useState<string | null>(null)

  const isSubmitting = uploadMutation.isPending || createMutation.isPending

  const submit = useCallback(
    async ({
      files,
      representativePhotoIndex,
      buildRequest,
    }: SubmitPetPostingInput): Promise<string | null> => {
      setError(null)
      try {
        // 백엔드는 사진 1~10장 필수
        if (files.length < 1) {
          setError('사진을 최소 1장 첨부해주세요.')
          return null
        }

        // 1) 이미지 업로드 → 파일명 확보
        const uploaded = await uploadMutation.mutateAsync({
          files,
          folder: PET_POSTING_UPLOAD_FOLDER,
        })
        const photos = uploaded.map((u) => u.fileName)

        const safeRepresentative =
          representativePhotoIndex >= 0 && representativePhotoIndex < photos.length
            ? representativePhotoIndex
            : 0

        // 2) 분양글 생성 (폼→DTO 매핑은 buildRequest 가 담당)
        const request = buildRequest(photos, safeRepresentative)
        const { petId } = await createMutation.mutateAsync(request)
        return petId
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '분양글 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        setError(message)
        return null
      }
    },
    [uploadMutation, createMutation],
  )

  return { submit, isSubmitting, error }
}
