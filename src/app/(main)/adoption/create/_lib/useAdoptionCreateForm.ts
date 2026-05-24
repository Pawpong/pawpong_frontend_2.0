'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useImageUpload } from '@/shared/lib/useImageUpload'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { adoptionCreateSchema, type AdoptionCreateFormValues } from './schema'

const useAdoptionCreateForm = () => {
  const router = useRouter()
  const [representativeIndex, setRepresentativeIndex] = useState(0)

  const form = useForm<AdoptionCreateFormValues>({
    resolver: zodResolver(adoptionCreateSchema),
    mode: 'onChange',
    defaultValues: {
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
    },
  })

  const { isDirty } = form.formState

  const { images, handleAddImages, handleRemoveImage: baseRemoveImage } = useImageUpload()

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

  const handleUpload = form.handleSubmit(() => {
    // TODO: 실제 API 호출 구현
    router.push('/adoption/create/success')
  })

  const handleSaveDraft = () => {
    // TODO: 임시저장 로직 구현
    cancelExit()
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
  }
}

export { useAdoptionCreateForm }
