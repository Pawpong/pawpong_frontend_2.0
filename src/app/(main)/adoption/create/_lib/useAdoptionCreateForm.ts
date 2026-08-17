'use client'

import { useCallback, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
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
import { useParentImages } from './useParentImages'

type ParentRow = AdoptionCreateParsedValues['parents'][number]

/** 한 칸이라도 채운 행 — 스키마 superRefine 의 '건드린 행' 판정과 같은 기준 */
const isParentRowTouched = (parent: ParentRow) =>
  Boolean(parent.relationship || parent.name || parent.breed || parent.birthDate)

const useAdoptionCreateForm = () => {
  const router = useRouter()
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

  const handleRemoveImage = useCallback(
    (index: number) => {
      petImages.handleRemoveImage(index)
      setRepresentativeIndex((prev) => {
        if (index === prev) return 0
        if (index < prev) return prev - 1
        return prev
      })
    },
    [petImages],
  )

  const hasImages =
    petImages.files.length > 0 || parentImages.hasFiles || breedingEnvImages.files.length > 0

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: () => isDirty || hasImages,
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

    // 사진은 폼 밖(useImageUpload) 상태라 zod가 못 본다. 서버 계약(1~10장)을 여기서 확인한다
    if (petImages.files.length === 0) {
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
      values,
      petFiles: petImages.files,
      parentFiles: parentImages.filesInOrder(parentRowIds),
      breedingEnvFiles: breedingEnvImages.files,
      representativeIndex,
    })

    if (petId) {
      router.replace(`/adoption/create/success?petId=${encodeURIComponent(petId)}`)
    }
  })

  const handleSaveDraft = () => {
    // TODO: 서버에 분양글 임시저장 엔드포인트가 없다. 계약 확정 후 연결
    cancelExit()
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
    // 사진 미등록은 버튼을 막지 않는다 — 눌러서 사유를 보게 해야 왜 못 올리는지 알 수 있다
    canSubmit: isValid,
    submitError: submitError ?? submission.error,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleUpload,
    handleSaveDraft,
  }
}

export { useAdoptionCreateForm }
