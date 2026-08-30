'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { petPostingQueries } from '@/entities/pet-posting'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import {
  adoptionCreateSchema,
  type AdoptionCreateFormValues,
  type AdoptionCreateParsedValues,
} from './schema'
import { BREEDING_ENV_IMAGE_MAX, PET_IMAGE_MAX } from './constants'
import { createAdoptionDefaultValues, createParentRow } from './defaultValues'
import { useCreatePostingSubmission } from './useCreatePostingSubmission'
import { useSaveDraftSubmission } from './useSaveDraftSubmission'
import { fromPetPostingDraft } from './fromPetPostingDraft'
import { useParentImages } from './useParentImages'

type ParentRow = AdoptionCreateParsedValues['parents'][number]

/** 한 칸이라도 채운 행 — 스키마 superRefine 의 '건드린 행' 판정과 같은 기준 */
const isParentRowTouched = (parent: ParentRow) =>
  Boolean(parent.relationship || parent.name || parent.breed || parent.birthDate)

const useAdoptionCreateForm = () => {
  const router = useRouter()
  // 임시저장 이어쓰기 — ?draftId= 로 들어오면 서버에 저장된 값으로 폼을 채운다
  const draftId = useSearchParams().get('draftId')
  const [representativeIndex, setRepresentativeIndex] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // resolver가 price를 number로 바꾸므로 입력 타입과 출력 타입을 분리해 선언한다
  const form = useForm<AdoptionCreateFormValues, unknown, AdoptionCreateParsedValues>({
    resolver: zodResolver(adoptionCreateSchema),
    mode: 'onChange',
    defaultValues: createAdoptionDefaultValues(),
  })

  const { isDirty, isValid } = form.formState

  const petImages = useImageUpload({ maxImages: PET_IMAGE_MAX })
  const breedingEnvImages = useImageUpload({ maxImages: BREEDING_ENV_IMAGE_MAX })

  // 부모는 사진이 행 단위라 행 목록과 사진을 한곳에서 붙여 관리한다 (행 삭제 시 사진도 같이 정리)
  const parentFieldArray = useFieldArray({ control: form.control, name: 'parents' })
  const parentImages = useParentImages()
  const parentRowIds = parentFieldArray.fields.map((field) => field.id)

  const appendParentRow = useCallback(() => {
    parentFieldArray.append(createParentRow())
  }, [parentFieldArray])

  const removeParentRow = useCallback(
    (index: number) => {
      const rowId = parentFieldArray.fields[index]?.id
      if (rowId) parentImages.remove(rowId)
      parentFieldArray.remove(index)
    },
    [parentFieldArray, parentImages],
  )

  const submission = useCreatePostingSubmission()
  const draftSubmission = useSaveDraftSubmission()

  const { data: draft } = useQuery({
    ...petPostingQueries.draft(draftId ?? ''),
    enabled: Boolean(draftId),
  })

  // 복원은 최초 1회만 — 이후 사용자가 고친 값을 다시 덮어쓰면 안 된다
  const restoredRef = useRef(false)
  useEffect(() => {
    if (!draft || restoredRef.current) return
    restoredRef.current = true

    form.reset(fromPetPostingDraft(draft.form))

    const restoredPhotos = draft.form.photos ?? []
    // 초안은 검증 없이 저장되므로 대표 인덱스가 사진 개수를 벗어나 있을 수 있다.
    // 그대로 두면 서버에 범위 밖 인덱스가 나가므로 사진 범위로 고정한다
    const savedIndex = draft.form.representativePhotoIndex ?? 0
    const restoredRepresentativeIndex =
      savedIndex >= 0 && savedIndex < restoredPhotos.length ? savedIndex : 0
    // 서버 응답을 폼에 동기화하는 effect 안에서 연쇄 렌더를 만들지 않도록 다음 microtask에 반영한다.
    queueMicrotask(() => setRepresentativeIndex(restoredRepresentativeIndex))

    petImages.seedExisting(
      restoredPhotos.map((fileName, index) => ({
        fileName,
        url: draft.photoUrls.pet[index] ?? '',
      })),
    )

    const envFileName = draft.form.breedingEnvironment?.photoFileName
    if (envFileName && draft.photoUrls.breedingEnvironment) {
      breedingEnvImages.seedExisting([
        { fileName: envFileName, url: draft.photoUrls.breedingEnvironment },
      ])
    }
  }, [draft, form, petImages, breedingEnvImages])

  /**
   * 부모 사진 복원은 한 박자 늦다.
   * 사진 키가 행 id 기준인데 그 id 는 form.reset 이후 useFieldArray 가 새로 만들기 때문에,
   * 행이 실제로 생긴 뒤에 짝지어야 한다.
   */
  const parentRestoredRef = useRef(false)
  useEffect(() => {
    if (!draft || parentRestoredRef.current) return
    const snapshots = draft.form.parentPetSnapshots ?? []
    if (snapshots.length === 0 || parentRowIds.length < snapshots.length) return
    parentRestoredRef.current = true

    parentImages.seedExisting(
      snapshots.flatMap((snapshot, index) => {
        const url = draft.photoUrls.parents[index]
        const rowId = parentRowIds[index]
        if (!snapshot.photoFileName || !url || !rowId) return []
        return [{ rowId, url, fileName: snapshot.photoFileName }]
      }),
    )
  }, [draft, parentRowIds, parentImages])

  const removePetImage = petImages.handleRemoveImage
  const handleRemoveImage = useCallback(
    (index: number) => {
      removePetImage(index)
      setRepresentativeIndex((prev) => {
        if (index === prev) return 0
        if (index < prev) return prev - 1
        return prev
      })
    },
    [removePetImage, setRepresentativeIndex],
  )

  /**
   * 저장하지 않은 사진 변경이 있는가.
   *
   * 임시저장에서 복원한 사진이 '그대로 있는 것'은 이미 저장된 상태라 변경이 아니다.
   * 그걸 변경으로 보면 이어쓰기로 들어오자마자 나갈 때 헛경고가 뜬다.
   */
  const hasUnsavedImageChanges =
    petImages.hasUnsavedChanges ||
    parentImages.hasUnsavedChanges ||
    breedingEnvImages.hasUnsavedChanges

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: () => isDirty || hasUnsavedImageChanges,
  })

  const handleCloseClick = () => {
    if (requestExit()) {
      router.push('/adoption/my-listings')
    }
  }

  const handleExitConfirm = () => {
    confirmExit(() => router.push('/adoption/my-listings'))
  }

  const handleUpload = form.handleSubmit(async (values) => {
    setSubmitError(null)
    submission.clearError()

    // 사진은 폼 밖(useImageUpload) 상태라 zod가 못 본다. 서버 계약(1~10장)을 여기서 확인한다.
    // files 는 '새로 올릴 파일'만이라 임시저장에서 복원한 사진이 빠진다 — 화면에 걸린 전부(entries)를 센다
    if (petImages.entries.length === 0) {
      setSubmitError('분양 개체 사진을 1장 이상 등록해주세요.')
      return
    }

    // 사진만 올리고 정보를 비운 행은 스냅샷에서 빠져 사진이 고아가 된다 — 먼저 막는다
    const orphanPhotoRow = parentRowIds.findIndex(
      (rowId, index) =>
        parentImages.imagesOf(rowId).length > 0 && !isParentRowTouched(values.parents[index]),
    )
    if (orphanPhotoRow >= 0) {
      form.setError(`parents.${orphanPhotoRow}.relationship`, {
        message: '부모 사진의 정보를 입력해주세요.',
      })
      return
    }

    const petId = await submission.submit({
      draftId,
      values,
      petEntries: petImages.entries,
      petFiles: petImages.files,
      parentFiles: parentImages.filesInOrder(parentRowIds),
      parentExistingFileNames: parentImages.existingFileNamesInOrder(parentRowIds),
      breedingEnvEntries: breedingEnvImages.entries,
      breedingEnvFiles: breedingEnvImages.files,
      representativeIndex,
    })

    if (petId) {
      router.replace(`/adoption/create/success?petId=${encodeURIComponent(petId)}`)
    }
  })

  /**
   * 임시저장 — 검증 없이 지금까지 입력한 값을 그대로 보낸다.
   * 성공하면 이탈 가드를 풀고 임시저장 목록으로 보내, 저장됐다는 걸 눈으로 확인하게 한다.
   */
  const handleSaveDraft = async () => {
    setSubmitError(null)

    const savedDraftId = await draftSubmission.save({
      draftId,
      values: form.getValues(),
      petEntries: petImages.entries,
      petFiles: petImages.files,
      parentFiles: parentImages.filesInOrder(parentRowIds),
      parentExistingFileNames: parentImages.existingFileNamesInOrder(parentRowIds),
      breedingEnvEntries: breedingEnvImages.entries,
      breedingEnvFiles: breedingEnvImages.files,
      representativeIndex,
    })

    if (!savedDraftId) return

    cancelExit()
    // 저장된 내용은 서버가 갖고 있으므로 폼을 비워 이탈 가드가 다시 뜨지 않게 한다
    form.reset(form.getValues(), { keepValues: true, keepDirty: false })
    router.push('/adoption/drafts')
  }

  return {
    form,
    petImages: { ...petImages, handleRemoveImage },
    breedingEnvImages,
    parentRows: {
      fields: parentFieldArray.fields,
      append: appendParentRow,
      remove: removeParentRow,
      imagesOf: parentImages.imagesOf,
      addImage: parentImages.add,
      removeImage: parentImages.remove,
    },
    representativeIndex,
    setRepresentativeIndex,
    isSubmitting: submission.isSubmitting,
    isSavingDraft: draftSubmission.isSaving,
    // 사진 미등록은 버튼을 막지 않는다 — 눌러서 사유를 보게 해야 왜 못 올리는지 알 수 있다
    canSubmit: isValid,
    submitError: submitError ?? submission.error ?? draftSubmission.error,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleUpload,
    handleSaveDraft,
  }
}

/**
 * 부모 행 목록 + 행별 사진 번들 — ParentInfoSection 이 그대로 소비한다.
 * 훅이 만드는 실제 형태에서 파생시켜, 여기서 필드를 늘려도 소비처 타입이 조용히 어긋나지 않게 한다.
 */
export type ParentRows = ReturnType<typeof useAdoptionCreateForm>['parentRows']

export { useAdoptionCreateForm }
