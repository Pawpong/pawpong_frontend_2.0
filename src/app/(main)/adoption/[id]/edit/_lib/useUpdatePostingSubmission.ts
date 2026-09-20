'use client'

import { useCallback, useRef, useState } from 'react'
import { useUpdatePetPosting } from '@/features/pet-posting'
import { useDeleteFile, useUploadMultipleFiles } from '@/features/upload'
import { isApiError } from '@/shared/api'
import { composeImageKeys } from '@/shared/lib/composeImageKeys'
import type { ImageEntry } from '@/shared/lib/useImageUpload'
import type { UpdatePetPostingRequest } from '@/shared/types'
import { ADOPTION_UPLOAD_FOLDER } from '../../../create/_lib/constants'
import { toCreatePetPostingRequest } from '../../../create/_lib/toCreatePetPostingRequest'
import type { AdoptionCreateParsedValues } from '../../../create/_lib/schema'

interface UpdatePostingSubmissionInput {
  petId: string
  values: AdoptionCreateParsedValues
  representativeIndex: number
  /** 분양 개체 사진 — 이미 올라간 것과 새로 고른 것이 표시 순서대로 섞여 있다 */
  petEntries: ImageEntry[]
  petFiles: File[]
  /** 부모 행 순서대로 각 행의 사진 (사진 없는 행·이미 올라간 행은 빈 배열) */
  parentFiles: File[][]
  /** 부모 행 순서대로 이미 올라간 파일키 (없으면 undefined) */
  parentExistingFileNames: (string | undefined)[]
  breedingEnvEntries: ImageEntry[]
  breedingEnvFiles: File[]
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '분양글 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.'

/**
 * 수정 제출 — 새로 고른 사진만 올리고, 기존 사진은 파일키를 그대로 돌려보낸다.
 *
 * 작성(useCreatePostingSubmission)과 사진 처리 뼈대가 같다. 다른 점은 세 가지뿐이다.
 *   1) 마지막 호출이 POST 가 아니라 PATCH
 *   2) draftId 개념이 없다 (발행된 글이라 정리할 초안이 없다)
 *   3) 실패 시 정리 판단에서 '이미 서버에 있던 사진'은 절대 지우면 안 된다 —
 *      이번에 올린 파일(uploadedFileNames)만 정리 대상이다
 * 공통 부분을 features 레이어로 올리는 건 작성 플로우까지 건드려야 해서 후속 과제로 남긴다.
 */
const useUpdatePostingSubmission = () => {
  const { mutateAsync: uploadFilesAsync } = useUploadMultipleFiles()
  const { mutateAsync: deleteFileAsync } = useDeleteFile()
  const { mutateAsync: updatePostingAsync } = useUpdatePetPosting()
  const submittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async ({
      petId,
      values,
      representativeIndex,
      petEntries,
      petFiles,
      parentFiles,
      parentExistingFileNames,
      breedingEnvEntries,
      breedingEnvFiles,
    }: UpdatePostingSubmissionInput): Promise<boolean> => {
      if (submittingRef.current) return false

      submittingRef.current = true
      setIsSubmitting(true)
      setError(null)

      let uploadedFileNames: string[] = []
      let updated = false
      let updateRequestStarted = false

      const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return []
        const uploaded = await uploadFilesAsync({ files, folder: ADOPTION_UPLOAD_FOLDER })
        return uploaded.map((file) => file.fileName)
      }

      try {
        const uploadGroups = [petFiles, ...parentFiles, breedingEnvFiles.slice(0, 1)]
        const uploadResults = await Promise.allSettled(uploadGroups.map(uploadFiles))

        uploadedFileNames = uploadResults.flatMap((result) =>
          result.status === 'fulfilled' ? result.value : [],
        )

        const failedUpload = uploadResults.find(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        )
        if (failedUpload) throw failedUpload.reason

        const uploadedGroups = uploadResults.map((result) =>
          result.status === 'fulfilled' ? result.value : [],
        )
        const [pet = [], ...rest] = uploadedGroups
        const parents = rest
          .slice(0, parentFiles.length)
          .map((names, index) => parentExistingFileNames[index] ?? names[0])
        const breedingEnv = composeImageKeys(
          breedingEnvEntries.slice(0, 1),
          rest[parentFiles.length] ?? [],
        )[0]

        // 작성 요청과 수정 요청은 필드가 그대로 대응한다 (수정 쪽은 전부 옵션).
        // draftId 만 수정에 없으므로 넘기지 않는다.
        const { draftId: _draftId, ...request } = toCreatePetPostingRequest(values, {
          pet: composeImageKeys(petEntries, pet),
          representativeIndex,
          parents,
          breedingEnv,
        })

        updateRequestStarted = true
        await updatePostingAsync({ petId, data: request satisfies UpdatePetPostingRequest })
        updated = true
        return true
      } catch (submitError) {
        // 수정 요청 전 실패 또는 명확한 4xx 거절만 정리한다. 네트워크/5xx 는 서버에 반영됐지만
        // 응답만 유실됐을 수 있어, 참조 중일지 모르는 파일을 지우면 안 된다.
        const isDefinitiveRejection =
          isApiError(submitError) &&
          submitError.status !== undefined &&
          submitError.status >= 400 &&
          submitError.status < 500 &&
          submitError.status !== 408
        const canCleanup = !updateRequestStarted || isDefinitiveRejection

        // 이번에 올린 파일만 지운다 — 기존 사진의 파일키는 여기 담기지 않는다
        if (!updated && canCleanup && uploadedFileNames.length > 0) {
          await Promise.allSettled(uploadedFileNames.map((fileName) => deleteFileAsync(fileName)))
        }
        setError(getErrorMessage(submitError))
        return false
      } finally {
        submittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [updatePostingAsync, deleteFileAsync, uploadFilesAsync],
  )

  return { submit, isSubmitting, error, clearError: () => setError(null) }
}

export { useUpdatePostingSubmission }
