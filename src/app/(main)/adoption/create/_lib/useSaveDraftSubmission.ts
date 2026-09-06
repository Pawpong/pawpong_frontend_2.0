'use client'

import { useCallback, useRef, useState } from 'react'
import { useSavePetPostingDraft, useOverwritePetPostingDraft } from '@/features/pet-posting'
import { useUploadMultipleFiles } from '@/features/upload'
import { composeImageKeys } from '@/shared/lib/composeImageKeys'
import type { ImageEntry } from '@/shared/lib/useImageUpload'
import type { AdoptionCreateFormValues } from './schema'
import { ADOPTION_UPLOAD_FOLDER } from './constants'
import { toSavePetPostingDraftRequest } from './toSavePetPostingDraftRequest'

interface SaveDraftInput {
  /** 이어쓰기 중이면 그 초안을 덮어쓴다 (없으면 새로 만든다) */
  draftId?: string | null
  values: AdoptionCreateFormValues
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
  error instanceof Error ? error.message : '임시저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'

/**
 * 분양글 임시저장
 *
 * 발행 제출(useCreatePostingSubmission)과 달리 폼 검증을 요구하지 않는다.
 * 사진은 파일키로만 저장할 수 있으므로 업로드는 동일하게 먼저 수행한다.
 *
 * 업로드 실패 시 올라간 파일을 지우지 않는다. 발행 경로는 글 생성이 확정 거절되면
 * 파일이 영영 참조되지 않아 정리하지만, 임시저장은 사용자가 이어서 다시 저장할 수 있어
 * 지웠다가는 이미 저장된 초안의 사진까지 깨뜨릴 수 있다.
 */
const useSaveDraftSubmission = () => {
  const { mutateAsync: uploadFilesAsync } = useUploadMultipleFiles()
  const { mutateAsync: saveDraftAsync } = useSavePetPostingDraft()
  const { mutateAsync: overwriteDraftAsync } = useOverwritePetPostingDraft()
  const savingRef = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback(
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
    }: SaveDraftInput): Promise<string | null> => {
      if (savingRef.current) return null

      savingRef.current = true
      setIsSaving(true)
      setError(null)

      const uploadFiles = async (files: File[]) => {
        if (files.length === 0) return []
        const uploaded = await uploadFilesAsync({ files, folder: ADOPTION_UPLOAD_FOLDER })
        return uploaded.map((file) => file.fileName)
      }

      try {
        // 발행 경로와 같은 순서로 묶어 올린다 (사육 환경은 서버가 1장만 받는다)
        const uploadGroups = [petFiles, ...parentFiles, breedingEnvFiles.slice(0, 1)]
        const uploadedGroups = await Promise.all(uploadGroups.map(uploadFiles))

        const [pet = [], ...rest] = uploadedGroups
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

        const request = toSavePetPostingDraftRequest(values, {
          // 이미 올라간 사진은 재업로드하지 않고 키를 그대로 쓴다 (재저장마다 고아 파일이 쌓이지 않게)
          pet: composeImageKeys(petEntries, pet),
          representativeIndex,
          parents,
          breedingEnv,
        })

        // 이어쓰기 중이면 덮어쓴다 — 새로 만들면 저장할 때마다 초안이 늘어난다
        const saved = draftId
          ? await overwriteDraftAsync({ draftId, data: request })
          : await saveDraftAsync(request)
        return saved.draftId
      } catch (saveError) {
        setError(getErrorMessage(saveError))
        return null
      } finally {
        savingRef.current = false
        setIsSaving(false)
      }
    },
    [uploadFilesAsync, saveDraftAsync, overwriteDraftAsync],
  )

  return { save, isSaving, error }
}

export { useSaveDraftSubmission }
