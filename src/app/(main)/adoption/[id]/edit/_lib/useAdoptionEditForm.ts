'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { petPostingQueries } from '@/entities/pet-posting'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import {
  adoptionCreateSchema,
  type AdoptionCreateFormValues,
  type AdoptionCreateParsedValues,
} from '../../../create/_lib/schema'
import { BREEDING_ENV_IMAGE_MAX, PET_IMAGE_MAX } from '../../../create/_lib/constants'
import { createAdoptionDefaultValues, createParentRow } from '../../../create/_lib/defaultValues'
import { fromPetPostingDraft } from '../../../create/_lib/fromPetPostingDraft'
import { useParentImages } from '../../../create/_lib/useParentImages'
import { useUpdatePostingSubmission } from './useUpdatePostingSubmission'

type ParentRow = AdoptionCreateParsedValues['parents'][number]

/** 한 칸이라도 채운 행 — 스키마 superRefine 의 '건드린 행' 판정과 같은 기준 */
const isParentRowTouched = (parent: ParentRow) =>
  Boolean(parent.relationship || parent.name || parent.breed || parent.birthDate)

/**
 * 분양글 수정 폼.
 *
 * 작성 폼(useAdoptionCreateForm)과 스키마·섹션·사진 처리를 전부 공유한다.
 * 다른 점은 세 가지다.
 *   1) 초기값을 임시저장이 아니라 발행된 글(GET :petId)에서 가져온다.
 *      서버가 작성 요청과 같은 shape 으로 내려주므로 fromPetPostingDraft 를 그대로 쓴다.
 *   2) 임시저장 버튼이 없다 — 이미 발행된 글이라 저장할 초안이 없다.
 *   3) 나가기·저장 후 목적지가 목록이 아니라 그 글의 상세다.
 */
const useAdoptionEditForm = (petId: string) => {
  const router = useRouter()
  const [representativeIndex, setRepresentativeIndex] = useState(0)
  const [savedRepresentativeIndex, setSavedRepresentativeIndex] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<AdoptionCreateFormValues, unknown, AdoptionCreateParsedValues>({
    resolver: zodResolver(adoptionCreateSchema),
    mode: 'onChange',
    defaultValues: createAdoptionDefaultValues(),
  })

  const { isDirty, isValid } = form.formState

  const petImages = useImageUpload({ maxImages: PET_IMAGE_MAX })
  const breedingEnvImages = useImageUpload({ maxImages: BREEDING_ENV_IMAGE_MAX })

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

  const submission = useUpdatePostingSubmission()

  const postingQuery = useQuery({
    ...petPostingQueries.forEdit(petId),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const posting = postingQuery.data

  // 복원은 최초 1회만 — 이후 사용자가 고친 값을 다시 덮어쓰면 안 된다
  const restoredRef = useRef(false)
  useEffect(() => {
    if (!posting || restoredRef.current) return
    restoredRef.current = true

    form.reset(fromPetPostingDraft(posting.form))

    const restoredPhotos = posting.form.photos ?? []
    // 발행된 글은 대표 인덱스가 항상 사진 범위 안이지만, 레거시 데이터가 어긋나 있을 수 있어
    // 임시저장과 같은 방식으로 범위를 고정한다
    const savedIndex = posting.form.representativePhotoIndex ?? 0
    const restoredRepresentativeIndex =
      savedIndex >= 0 && savedIndex < restoredPhotos.length ? savedIndex : 0
    queueMicrotask(() => {
      setRepresentativeIndex(restoredRepresentativeIndex)
      setSavedRepresentativeIndex(restoredRepresentativeIndex)
    })

    petImages.seedExisting(
      restoredPhotos.map((fileName, index) => ({
        fileName,
        url: posting.photoUrls.pet[index] ?? '',
      })),
    )

    const envFileName = posting.form.breedingEnvironment?.photoFileName
    if (envFileName && posting.photoUrls.breedingEnvironment) {
      breedingEnvImages.seedExisting([
        { fileName: envFileName, url: posting.photoUrls.breedingEnvironment },
      ])
    }
  }, [posting, form, petImages, breedingEnvImages])

  /**
   * 부모 사진 복원은 한 박자 늦다 — 사진 키가 행 id 기준인데 그 id 는 form.reset 이후
   * useFieldArray 가 새로 만들기 때문에, 행이 실제로 생긴 뒤에 짝지어야 한다.
   */
  const parentRestoredRef = useRef(false)
  useEffect(() => {
    if (!posting || parentRestoredRef.current) return
    const snapshots = posting.form.parentPetSnapshots ?? []
    if (snapshots.length === 0 || parentRowIds.length < snapshots.length) return
    parentRestoredRef.current = true

    parentImages.seedExisting(
      snapshots.flatMap((snapshot, index) => {
        const url = posting.photoUrls.parents[index]
        const rowId = parentRowIds[index]
        if (!snapshot.photoFileName || !url || !rowId) return []
        return [{ rowId, url, fileName: snapshot.photoFileName }]
      }),
    )
  }, [posting, parentRowIds, parentImages])

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

  // 불러온 사진이 '그대로 있는 것'은 이미 저장된 상태라 변경이 아니다
  const hasUnsavedImageChanges =
    petImages.hasUnsavedChanges ||
    parentImages.hasUnsavedChanges ||
    breedingEnvImages.hasUnsavedChanges
  const hasUnsavedRepresentativeChange = representativeIndex !== savedRepresentativeIndex

  const exitHref = `/adoption/${petId}`

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: () => isDirty || hasUnsavedImageChanges || hasUnsavedRepresentativeChange,
  })

  const handleCloseClick = () => {
    if (requestExit()) router.push(exitHref)
  }

  const handleExitConfirm = () => {
    confirmExit(() => router.push(exitHref))
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    submission.clearError()

    // 사진은 폼 밖(useImageUpload) 상태라 zod 가 못 본다. 서버 계약(1~10장)을 여기서 확인한다.
    if (petImages.entries.length === 0) {
      setSubmitError('분양 개체 사진을 1장 이상 등록해주세요.')
      return
    }

    // 사진만 남기고 정보를 비운 행은 스냅샷에서 빠져 사진이 고아가 된다 — 먼저 막는다
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

    const ok = await submission.submit({
      petId,
      values,
      petEntries: petImages.entries,
      petFiles: petImages.files,
      parentFiles: parentImages.filesInOrder(parentRowIds),
      parentExistingFileNames: parentImages.existingFileNamesInOrder(parentRowIds),
      breedingEnvEntries: breedingEnvImages.entries,
      breedingEnvFiles: breedingEnvImages.files,
      representativeIndex,
    })

    if (ok) {
      // 이탈 가드를 먼저 풀지 않으면 이동하면서 '나가시겠어요' 가 뜬다
      cancelExit()
      form.reset(form.getValues(), { keepValues: true, keepDirty: false })
      router.replace(exitHref)
    }
  })

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
    canSubmit: isValid,
    submitError: submitError ?? submission.error,
    isLoading: postingQuery.isPending,
    isLoadError: postingQuery.isError && !posting,
    retry: postingQuery.refetch,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleSubmit,
  }
}

export { useAdoptionEditForm }
