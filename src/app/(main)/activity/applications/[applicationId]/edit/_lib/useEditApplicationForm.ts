'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateApplication } from '@/features/application'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { useToast } from '@/shared/lib/useToast'
import { normalizeApiError } from '@/shared/api'
import type { ApplicationDetailDto, ApplicationUpdateRequest } from '@/shared/types'
import {
  applicationSchema,
  type ApplicationFormValues,
} from '@/app/(main)/adoption/[id]/apply/_lib/schema'

const SUBMIT_ERROR_FALLBACK = '신청서를 수정하지 못했습니다.'

// 생성 시 조사(자기소개/집 비우는 시간/거주 공간)를 건너뛴 입양자는 그 값이 전부 비어있거나
// adoptionPlan 이 selfIntroduction 자리에 대신 저장돼 있다 — 수정 화면은 그 조사 항목을 다시
// 묻지 않고, 항상 노출되는 입양 계획/가족 구성원/동의 항목만 재작성 대상으로 삼는다.
const toDefaultValues = (detail: ApplicationDetailDto): ApplicationFormValues => ({
  adoptionPlan: detail.standardResponses?.selfIntroduction ?? '',
  privacyConsent: detail.standardResponses?.privacyConsent ?? false,
  canProvideBasicCare: detail.standardResponses?.canProvideBasicCare ?? false,
  canAffordMedicalExpenses: detail.standardResponses?.canAffordMedicalExpenses ?? false,
  familyMembers: detail.standardResponses?.familyMembers ?? '',
  allFamilyConsent: detail.standardResponses?.allFamilyConsent ?? false,
})

// 조사 항목(allergyTestInfo 등)은 이 화면에서 다시 묻지 않으므로, 기존에 저장돼 있던 값을
// 그대로 들려보내 수정 화면에서 노출하지 않는 필드가 조용히 비워지는 걸 막는다.
const toUpdateApplicationRequest = (
  data: ApplicationFormValues,
  detail: ApplicationDetailDto,
): ApplicationUpdateRequest => ({
  privacyConsent: data.privacyConsent,
  selfIntroduction: data.adoptionPlan,
  familyMembers: data.familyMembers,
  allFamilyConsent: data.allFamilyConsent,
  canProvideBasicCare: data.canProvideBasicCare,
  canAffordMedicalExpenses: data.canAffordMedicalExpenses,
  allergyTestInfo: detail.standardResponses?.allergyTestInfo ?? '',
  timeAwayFromHome: detail.standardResponses?.timeAwayFromHome ?? '',
  livingSpaceDescription: detail.standardResponses?.livingSpaceDescription ?? '',
  previousPetExperience: detail.standardResponses?.previousPetExperience ?? '',
  preferredPetDescription: detail.standardResponses?.preferredPetDescription,
  desiredAdoptionTiming: detail.standardResponses?.desiredAdoptionTiming,
  additionalNotes: detail.standardResponses?.additionalNotes,
})

const useEditApplicationForm = (applicationId: string, detail: ApplicationDetailDto) => {
  const router = useRouter()
  const { mutate: updateApplication, isPending } = useUpdateApplication()
  const toast = useToast()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isValid, isDirty },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: toDefaultValues(detail),
  })

  const {
    showGuard,
    requestExit,
    confirmExit: rawConfirmExit,
    cancelExit,
  } = useExitGuard({ hasChanges: isDirty, confirmAlways: false })

  const handleCloseClick = () => {
    if (requestExit()) router.back()
  }
  const confirmExit = () => rawConfirmExit(() => window.history.go(-2))

  const onSubmit = (data: ApplicationFormValues) => {
    updateApplication(
      { applicationId, data: toUpdateApplicationRequest(data, detail) },
      {
        onSuccess: () => router.push(`/activity/applications/${applicationId}`),
        onError: (error) => toast.error(normalizeApiError(error, SUBMIT_ERROR_FALLBACK).message),
      },
    )
  }

  return {
    register,
    control,
    handleSubmit,
    watch,
    isValid,
    isPending,
    showGuard,
    confirmExit,
    cancelExit,
    handleCloseClick,
    onSubmit,
    toast,
  }
}

export { useEditApplicationForm }
