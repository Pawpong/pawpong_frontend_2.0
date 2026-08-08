'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateApplication } from '@/features/application'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { clearSurveySkipped } from '@/shared/lib/surveySkip'
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
      selfIntroduction: '',
      timeAwayFromHome: '',
      livingSpaceDescription: '',
    },
  })

  const {
    showGuard,
    requestExit,
    confirmExit: rawConfirmExit,
    cancelExit,
  } = useExitGuard({
    hasChanges: isDirty,
    // 입양 신청은 취소/X 시 입력 여부와 무관하게 항상 "그만두시나요?" 확인
    confirmAlways: true,
  })

  const handleCloseClick = () => {
    if (requestExit()) {
      router.back()
    }
  }

  // X/취소(programmatic)로 띄운 가드에서 "그만두기" 시 실제로 이탈.
  // useExitGuard가 심은 히스토리 1칸 + 폼 1칸을 되돌려야 진입 이전 페이지로 나가진다(브라우저 가드 경로와 동일 go(-2)).
  const confirmExit = () => rawConfirmExit(() => window.history.go(-2))

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
        // 조사 항목까지 신청서로 제출됐으므로 건너뜀 플래그 해제
        clearSurveySkipped()
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
