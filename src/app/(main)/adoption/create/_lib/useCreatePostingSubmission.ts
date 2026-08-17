'use client'

import { useCallback, useRef, useState } from 'react'
import { useCreatePetPosting } from '@/features/pet-posting'
import { useDeleteFile, useUploadMultipleFiles } from '@/features/upload'
import { isApiError } from '@/shared/api'
import type { AdoptionCreateParsedValues } from './schema'
import { ADOPTION_UPLOAD_FOLDER } from './constants'
import { toCreatePetPostingRequest } from './toCreatePetPostingRequest'

interface CreatePostingSubmissionInput {
  values: AdoptionCreateParsedValues
  representativeIndex: number
  petFiles: File[]
  /** 부모 행 순서대로 각 행의 사진 (사진 없는 행은 빈 배열) */
  parentFiles: File[][]
  breedingEnvFiles: File[]
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '분양글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'

/** 파일 업로드부터 글 생성, 실패한 업로드 정리까지 하나의 제출 단위로 관리한다. */
const useCreatePostingSubmission = () => {
  const uploadMutation = useUploadMultipleFiles()
  const deleteMutation = useDeleteFile()
  const createMutation = useCreatePetPosting()
  const submittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async ({
      values,
      representativeIndex,
      petFiles,
      parentFiles,
      breedingEnvFiles,
    }: CreatePostingSubmissionInput): Promise<string | null> => {
      if (submittingRef.current) return null

      submittingRef.current = true
      setIsSubmitting(true)
      setError(null)

      let uploadedFileNames: string[] = []
      let postingCreated = false
      let createRequestStarted = false

      const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return []
        const uploaded = await uploadMutation.mutateAsync({
          files,
          folder: ADOPTION_UPLOAD_FOLDER,
        })
        return uploaded.map((file) => file.fileName)
      }

      try {
        // 부모는 행마다 사진이 따로라 그룹을 펼쳐 올리고, 아래에서 같은 순서로 다시 나눈다.
        const uploadGroups = [petFiles, ...parentFiles, breedingEnvFiles]

        // 모든 업로드가 끝날 때까지 기다려야 일부 성공 후 실패한 파일도 빠짐없이 정리할 수 있다.
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
        // 부모는 행당 최대 1장이라 각 그룹의 첫 파일명만 쓴다
        const parents = rest.slice(0, parentFiles.length).map((names) => names[0])
        const breedingEnv = rest[parentFiles.length]?.[0]

        const request = toCreatePetPostingRequest(values, {
          pet,
          representativeIndex,
          parents,
          breedingEnv,
        })

        createRequestStarted = true
        const { petId } = await createMutation.mutateAsync(request)
        postingCreated = true
        return petId
      } catch (submitError) {
        // 생성 요청 전 실패 또는 명확한 4xx 거절만 정리한다. 네트워크/5xx는 서버에서
        // 생성됐지만 응답만 유실됐을 수 있어 참조 중인 파일을 지우면 안 된다.
        const isDefinitiveRejection =
          isApiError(submitError) &&
          submitError.status !== undefined &&
          submitError.status >= 400 &&
          submitError.status < 500 &&
          submitError.status !== 408
        const canCleanup = !createRequestStarted || isDefinitiveRejection

        if (!postingCreated && canCleanup && uploadedFileNames.length > 0) {
          await Promise.allSettled(
            uploadedFileNames.map((fileName) => deleteMutation.mutateAsync(fileName)),
          )
        }
        setError(getErrorMessage(submitError))
        return null
      } finally {
        submittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [createMutation, deleteMutation, uploadMutation],
  )

  return { submit, isSubmitting, error, clearError: () => setError(null) }
}

export { useCreatePostingSubmission }
