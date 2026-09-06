'use client'

import { useCallback, useRef, useState } from 'react'
import { useCreatePetPosting } from '@/features/pet-posting'
import { useDeleteFile, useUploadMultipleFiles } from '@/features/upload'
import { isApiError } from '@/shared/api'
import { composeImageKeys } from '@/shared/lib/composeImageKeys'
import type { ImageEntry } from '@/shared/lib/useImageUpload'
import type { AdoptionCreateParsedValues } from './schema'
import { ADOPTION_UPLOAD_FOLDER } from './constants'
import { toCreatePetPostingRequest } from './toCreatePetPostingRequest'

interface CreatePostingSubmissionInput {
  /** 임시저장에서 이어 쓴 경우 그 초안 ID */
  draftId?: string | null
  values: AdoptionCreateParsedValues
  representativeIndex: number
  /** 분양 개체 사진 — 이미 올라간 것과 새로 고른 것이 표시 순서대로 섞여 있다 */
  petEntries: ImageEntry[]
  petFiles: File[]
  /** 부모 행 순서대로 각 행의 사진 (사진 없는 행·이미 올라간 행은 빈 배열) */
  parentFiles: File[][]
  /** 부모 행 순서대로 이미 올라간 파일키 (없으면 undefined) */
  parentExistingFileNames: (string | undefined)[]
  /** 사육 환경 사진 — 이미 올라간 것과 새로 고른 것이 표시 순서대로 섞여 있다 */
  breedingEnvEntries: ImageEntry[]
  breedingEnvFiles: File[]
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '분양글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'

/** 파일 업로드부터 글 생성, 실패한 업로드 정리까지 하나의 제출 단위로 관리한다. */
const useCreatePostingSubmission = () => {
  // mutateAsync 는 observer 에 한 번 바인딩된 안정 참조지만, useMutation 이 돌려주는
  // 객체 자체는 렌더마다 새로 만들어진다. 함수만 뽑아야 아래 useCallback 이 실제로 memo 된다.
  const { mutateAsync: uploadFilesAsync } = useUploadMultipleFiles()
  const { mutateAsync: deleteFileAsync } = useDeleteFile()
  const { mutateAsync: createPostingAsync } = useCreatePetPosting()
  const submittingRef = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async ({
      draftId,
      values,
      representativeIndex,
      petEntries,
      petFiles,
      parentFiles,
      parentExistingFileNames,
      breedingEnvEntries,
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
        const uploaded = await uploadFilesAsync({
          files,
          folder: ADOPTION_UPLOAD_FOLDER,
        })
        return uploaded.map((file) => file.fileName)
      }

      try {
        // 부모는 행마다 사진이 따로라 그룹을 펼쳐 올리고, 아래에서 같은 순서로 다시 나눈다.
        // 사육 환경은 서버가 photoFileName 1장만 받으므로 나머지는 올리지 않는다 (고아 파일 방지)
        const uploadGroups = [petFiles, ...parentFiles, breedingEnvFiles.slice(0, 1)]

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
        // 이미 올라간 부모 사진은 키를 그대로 쓰고, 새로 고른 행만 업로드 결과로 채운다
        const parents = rest
          .slice(0, parentFiles.length)
          .map((names, index) => parentExistingFileNames[index] ?? names[0])
        // 서버는 사육 환경 사진을 1장만 받는다. 이미 올라간 사진이면 키를 그대로 쓰고,
        // 새로 고른 사진이면 업로드 결과를 쓴다 — 안 그러면 복원한 사진이 발행 때 사라진다
        const breedingEnv = composeImageKeys(
          breedingEnvEntries.slice(0, 1),
          rest[parentFiles.length] ?? [],
        )[0]

        const request = toCreatePetPostingRequest(values, {
          // 이미 올라간 사진은 재업로드하지 않고 키를 그대로 쓴다 (고아 파일 방지)
          pet: composeImageKeys(petEntries, pet),
          representativeIndex,
          parents,
          breedingEnv,
        }, draftId)

        createRequestStarted = true
        const { petId } = await createPostingAsync(request)
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
          await Promise.allSettled(uploadedFileNames.map((fileName) => deleteFileAsync(fileName)))
        }
        setError(getErrorMessage(submitError))
        return null
      } finally {
        submittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [createPostingAsync, deleteFileAsync, uploadFilesAsync],
  )

  return { submit, isSubmitting, error, clearError: () => setError(null) }
}

export { useCreatePostingSubmission }
