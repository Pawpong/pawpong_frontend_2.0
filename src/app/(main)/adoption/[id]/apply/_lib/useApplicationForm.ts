'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCreateApplication } from '@/features/application'
import { useMe } from '@/features/auth'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import { useExitGuard } from '@/shared/lib/useExitGuard'
import { useToast } from '@/shared/lib/useToast'
import { normalizeApiError } from '@/shared/api'
import { GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto } from '@/shared/types'
import { applicationSchema, type ApplicationFormValues } from './schema'
import { toCreateApplicationRequest } from './applicationRequest'
import { SUBMIT_ERROR_FALLBACK } from './constants'
import {
  applicationDraftKey,
  clearApplicationDraft,
  getDraftStorage,
  readApplicationDraft,
  writeApplicationDraft,
} from './applicationDraft'

const useApplicationForm = (detail: AdoptionDetailDto) => {
  const router = useRouter()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    subscribe,
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
    const customResponses = customQuestions
      .filter((q) => customAnswers[q.id]?.trim())
      .map((q) => ({ questionId: q.id, answer: customAnswers[q.id].trim() }))
    createApplication(toCreateApplicationRequest(detail, data, customResponses), {
      onSuccess: () => {
        setShowConsultConfirm(false)
        if (draftKey) clearApplicationDraft(getDraftStorage(), draftKey)
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

  // 브리더가 신청서 질문 관리에서 추가한 커스텀 질문 — react-hook-form 스키마는 정적이라
  // 브리더마다 다른 질문 목록을 태울 수 없어 별도 상태로 관리하고 제출 시 합친다.
  const customFormQuery = useQuery(breederQueries.applicationForm(detail.breeder.id))
  const customQuestions = customFormQuery.data?.customQuestions ?? []
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({})
  const setCustomAnswer = (questionId: string, value: string) => {
    const next = { ...customAnswers, [questionId]: value }
    setCustomAnswers(next)
    if (draftKey) writeApplicationDraft(getDraftStorage(), draftKey, getValues(), next)
  }

  // 임시저장 — 계정이 확인되면 이 분양글에 쓰던 신청서를 한 번 불러오고, 그 뒤 입력이 바뀔 때마다 저장한다.
  // 저장 콜백은 구독 시점에 고정되므로 브리더 질문 답은 ref 로 최신값을 읽는다.
  const { me } = useMe()
  const draftKey = me?.userId ? applicationDraftKey(me.userId, detail.listingId) : null
  const [draftRestored, setDraftRestored] = useState(false)
  const customAnswersRef = useRef(customAnswers)
  useEffect(() => {
    customAnswersRef.current = customAnswers
  }, [customAnswers])
  useEffect(() => {
    if (!draftKey) return
    const storage = getDraftStorage()
    const draft = readApplicationDraft(storage, draftKey)
    if (draft) {
      // keepDefaultValues — 불러온 값도 '수정됨'으로 쳐서 나가기 확인이 그대로 동작한다
      reset({ ...getValues(), ...draft.values }, { keepDefaultValues: true })
      // 저장소는 서버 렌더에 없는 외부 자원이라 하이드레이션 뒤 effect 에서 한 번만 읽어 반영한다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCustomAnswers(draft.customAnswers)
      setDraftRestored(true)
    }
    return subscribe({
      formState: { values: true },
      callback: ({ values }) =>
        writeApplicationDraft(storage, draftKey, values, customAnswersRef.current),
    })
  }, [draftKey, reset, getValues, subscribe])

  const customQuestionsValid = customQuestions.every(
    (q) => !q.required || (customAnswers[q.id]?.trim().length ?? 0) > 0,
  )

  return {
    register,
    control,
    handleSubmit,
    watch,
    isValid: isValid && customQuestionsValid,
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
    customQuestions,
    customAnswers,
    setCustomAnswer,
    canSaveDraft: !!draftKey,
    draftRestored,
    dismissDraftRestored: () => setDraftRestored(false),
    isProfilePending: adopterProfileQuery.isPending,
    isProfileError: adopterProfileQuery.isError,
    retryProfile: adopterProfileQuery.refetch,
    isFetching: adopterProfileQuery.isFetching,
    toast,
  }
}

export { useApplicationForm }
