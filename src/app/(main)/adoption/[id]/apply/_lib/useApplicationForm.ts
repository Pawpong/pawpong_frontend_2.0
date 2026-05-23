'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateApplication } from '@/features/application/model/hooks'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto } from '@/shared/types'
import { applicationSchema, getAgeText, type ApplicationFormValues } from './schema'

const useApplicationForm = (detail: AdoptionDetailDto) => {
  const router = useRouter()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      adoptionPlan: '',
      privacyConsent: false,
      canProvideBasicCare: false,
      canAffordMedicalExpenses: false,
      familyMembers: '',
      allFamilyConsent: false,
    },
  })

  const { showGuard, requestExit, confirmExit, cancelExit } = useExitGuard({
    hasChanges: isDirty,
  })

  const handleCloseClick = () => {
    if (requestExit()) {
      router.back()
    }
  }

  const onSubmit = (data: ApplicationFormValues) => {
    createApplication(
      {
        breederId: detail.breeder.id,
        petId: detail.listingId,
        privacyConsent: data.privacyConsent,
        selfIntroduction: data.adoptionPlan,
        familyMembers: data.familyMembers,
        allFamilyConsent: data.allFamilyConsent,
        canProvideBasicCare: data.canProvideBasicCare,
        canAffordMedicalExpenses: data.canAffordMedicalExpenses,
        allergyTestInfo: '',
        timeAwayFromHome: '',
        livingSpaceDescription: '',
        previousPetExperience: '',
      },
      {
        onSuccess: () => {
          router.push(`/adoption/${detail.listingId}`)
        },
      },
    )
  }

  const petSummary = `${detail.name} . ${GENDER_LABEL[detail.gender]} . ${getAgeText(detail.birthDate)}`

  return {
    register,
    control,
    handleSubmit,
    isValid,
    isPending,
    showGuard,
    confirmExit,
    cancelExit,
    handleCloseClick,
    onSubmit,
    petSummary,
  }
}

export { useApplicationForm }
