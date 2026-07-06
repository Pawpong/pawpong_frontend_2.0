'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { useSubmitPetPostingForm } from '@/features/pet-posting'
import { adoptionCreateSchema, type AdoptionCreateFormValues } from './schema'
import { toPetPostingRequest } from './toPetPostingRequest'

/** 임시저장 초안 로컬 저장 키 (백엔드 draft 엔드포인트 부재로 클라이언트에만 보관) */
const DRAFT_STORAGE_KEY = 'adoption-create-draft'

const DEFAULT_VALUES: AdoptionCreateFormValues = {
  name: '',
  breed: '',
  price: '',
  birthDate: '',
  gender: '',
  introduction: '',
  vaccinationStatus: '',
  vaccinationReason: '',
  vaccinations: [{ name: '', date: '', dose: '' }],
  geneticTestStatus: '',
  geneticTestReason: '',
  geneticTests: [{ date: '', institution: '', result: '', diseaseName: '' }],
  parents: [{ relationship: '', breedAndName: '', birthDate: '' }],
  breedingEnvDescription: '',
}

const useAdoptionCreateForm = () => {
  const router = useRouter()
  const [representativeIndex, setRepresentativeIndex] = useState(0)

  const form = useForm<AdoptionCreateFormValues>({
    resolver: zodResolver(adoptionCreateSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  })

  const { isDirty } = form.formState

  const { images, files, handleAddImages, handleRemoveImage: baseRemoveImage } = useImageUpload()

  const { submit, isSubmitting, error } = useSubmitPetPostingForm()

  // 마운트 시 로컬 초안이 있으면 텍스트 필드 복원 (이미지는 직렬화 불가라 제외)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw) as {
        values?: Partial<AdoptionCreateFormValues>
        representativeIndex?: number
      }
      if (draft.values) form.reset({ ...DEFAULT_VALUES, ...draft.values })
      if (typeof draft.representativeIndex === 'number') {
        setRepresentativeIndex(draft.representativeIndex)
      }
    } catch {
      // 손상된 초안은 무시
    }
    // 최초 1회만 복원
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveImage = useCallback(
    (index: number) => {
      baseRemoveImage(index)
      setRepresentativeIndex((prev) => {
        if (index === prev) return 0
        if (index < prev) return prev - 1
        return prev
      })
    },
    [baseRemoveImage],
  )

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: () => isDirty || images.length > 0,
  })

  const handleCloseClick = () => {
    if (requestExit()) {
      router.push('/adoption/my-listings')
    }
  }

  const handleExitConfirm = () => {
    confirmExit()
    router.push('/adoption/my-listings')
  }

  const handleUpload = form.handleSubmit(async (values) => {
    const petId = await submit({
      files,
      representativePhotoIndex: representativeIndex,
      buildRequest: (photos, repIndex) => toPetPostingRequest(values, photos, repIndex),
    })
    if (petId) {
      if (typeof window !== 'undefined') window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      router.push(`/adoption/create/success?petId=${petId}`)
    }
  })

  // 백엔드에 분양글 임시저장 엔드포인트가 없어 로컬(localStorage)에만 보관 — 이미지는 제외됨
  const handleSaveDraft = () => {
    if (typeof window !== 'undefined') {
      const draft = { values: form.getValues(), representativeIndex }
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    }
    confirmExit()
    router.push('/adoption/my-listings')
  }

  return {
    form,
    images,
    representativeIndex,
    setRepresentativeIndex,
    handleAddImages,
    handleRemoveImage,
    showGuard,
    cancelExit,
    handleCloseClick,
    handleExitConfirm,
    handleUpload,
    handleSaveDraft,
    isSubmitting,
    error,
  }
}

export { useAdoptionCreateForm }
