'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateApplication } from '@/features/application'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto } from '@/shared/types'
import { applicationSchema, getAgeText, type ApplicationFormValues } from './schema'
import { toCreateApplicationRequest } from './applicationRequest'

const useApplicationForm = (detail: AdoptionDetailDto) => {
  const router = useRouter()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const {
    register,
    control,
    handleSubmit,
    watch,
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

  const {
    showGuard,
    requestExit,
    confirmExit: rawConfirmExit,
    cancelExit,
  } = useExitGuard({
    hasChanges: isDirty,
  })

  const handleCloseClick = () => {
    if (requestExit()) {
      router.back()
    }
  }

  // X 버튼(programmatic)으로 띄운 가드에서 "그만두기" 시에도 실제로 나가도록 router.back() 주입
  const confirmExit = () => rawConfirmExit(() => router.back())

  // 제출 전 "입양 상담" 확인 모달 — 유효성 통과 시 바로 제출하지 않고 모달을 띄운다
  const [showConsultConfirm, setShowConsultConfirm] = useState(false)
  const pendingData = useRef<ApplicationFormValues | null>(null)

  const onSubmit = (data: ApplicationFormValues) => {
    pendingData.current = data
    setShowConsultConfirm(true)
  }

  // X/오버레이로 닫기 → consult 모달만 닫고 폼으로 복귀
  const cancelConsult = () => setShowConsultConfirm(false)

  // consult 모달의 "그만두기" → consult 닫고 기존 나가기 가드 모달 표시
  const giveUpFromConsult = () => {
    setShowConsultConfirm(false)
    handleCloseClick()
  }

  const confirmConsult = () => {
    const data = pendingData.current
    if (!data) return
    createApplication(toCreateApplicationRequest(detail, data), {
      onSuccess: () => {
        setShowConsultConfirm(false)
        router.push(`/adoption/${detail.listingId}`)
      },
    })
  }

  const petSummary = `${detail.name} . ${GENDER_LABEL[detail.gender]} . ${getAgeText(detail.birthDate)}`

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
    showConsultConfirm,
    confirmConsult,
    cancelConsult,
    giveUpFromConsult,
    petSummary,
  }
}

export { useApplicationForm }
