'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateApplication } from '@/features/application'
import { adopterQueries } from '@/entities/adopter'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { useToast } from '@/shared/lib/useToast'
import { normalizeApiError } from '@/shared/api'
import { GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto } from '@/shared/types'
import { applicationSchema, type ApplicationFormValues } from './schema'
import { toCreateApplicationRequest } from './applicationRequest'
import { SUBMIT_ERROR_FALLBACK } from './constants'

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

  // 신청 실패(중복 신청 409 / 분양 불가 400 / 브리더·펫 없음 404)를 알리는 토스트.
  // 전역 MutationCache 는 5xx 를 Sentry 로 보낼 뿐이라 4xx 는 화면에서 직접 처리해야 한다.
  const toast = useToast()

  const confirmConsult = () => {
    const data = pendingData.current
    if (!data) return
    createApplication(toCreateApplicationRequest(detail, data), {
      onSuccess: () => {
        setShowConsultConfirm(false)
        router.push(`/adoption/${detail.listingId}`)
      },
      onError: (error) => {
        // 모달을 닫아 폼으로 돌려보낸다 (입력값은 유지) — 서버 문구를 그대로 노출
        setShowConsultConfirm(false)
        toast.error(normalizeApiError(error, SUBMIT_ERROR_FALLBACK).message)
      },
    })
  }

  // 온보딩에서 '다음에 작성하기'로 조사 양식을 건너뛴 입양자에게만 조사 항목을 노출.
  // 서버가 답변이 하나도 없으면 counselDefaultProfile 을 null 로 내려준다 (건너뜀 판별의 유일한 근거).
  const adopterProfileQuery = useQuery({
    ...adopterQueries.profile(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const adopterProfile = adopterProfileQuery.data
  const needsSurvey = adopterProfile?.counselDefaultProfile === null

  const petSummary = `${detail.name} . ${GENDER_LABEL[detail.gender]} . ${detail.birthDate}`

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
    needsSurvey,
    isProfilePending: adopterProfileQuery.isPending,
    isProfileError: adopterProfileQuery.isError,
    retryProfile: adopterProfileQuery.refetch,
    toast,
  }
}

export { useApplicationForm }
