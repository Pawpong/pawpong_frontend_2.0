'use client'

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  type UserType,
  type OnboardingFormData,
  type FormStepId,
  type StepConfig,
  ONBOARDING_STEPS,
} from './types'
import { useOnboardingForm } from './useOnboardingForm'

interface OnboardingState {
  userType: UserType
  currentStepIndex: number
  formData: Partial<OnboardingFormData>
  steps: StepConfig[]
  /** 스텝 검증 통과 — 값 저장 + 완료 표시 */
  setFormData: <K extends FormStepId>(stepId: K, data: OnboardingFormData[K]) => void
  /** 검증 없이 입력값만 보관 (이전 단계로 이동할 때) */
  saveDraft: <K extends FormStepId>(stepId: K, data: OnboardingFormData[K]) => void
  /** 이 스텝부터 뒤쪽 완료 표시 해제 (앞 단계를 고치면 뒤 단계 값이 낡는다) */
  invalidateFrom: (stepId: FormStepId) => void
  goNext: () => void
  goBack: () => void
}

const OnboardingContext = createContext<OnboardingState | null>(null)

interface OnboardingProviderProps {
  userType: UserType
  children: React.ReactNode
}

const OnboardingProvider = ({ userType, children }: OnboardingProviderProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const steps = ONBOARDING_STEPS[userType]

  // 현재 스텝은 URL 에서 파생한다. state 로 복제하면 브라우저 뒤로/앞으로에서 URL 과 어긋나
  // 진행 표시와 goNext 목적지가 틀어진다
  const currentStepIndex = Math.max(
    steps.findIndex((step) => step.id === pathname.split('/').pop()),
    0,
  )

  // 입력값은 sessionStorage 에 산다(zustand persist) — 새로고침해도 유지된다
  const formData = useOnboardingForm((state) => state.drafts)
  const setFormData = useOnboardingForm((state) => state.completeStep)
  const saveDraft = useOnboardingForm((state) => state.saveDraft)
  const invalidateStoreFrom = useOnboardingForm((state) => state.invalidateFrom)

  const invalidateFrom = useCallback(
    (stepId: FormStepId) => invalidateStoreFrom(userType, stepId),
    [invalidateStoreFrom, userType],
  )

  // 복원은 하이드레이션 이후에 (persist 의 skipHydration) — 서버 HTML 과 첫 렌더를 맞추기 위해서다.
  // 복원값의 폼 반영은 useStepForm 이 담당한다
  useEffect(() => {
    void useOnboardingForm.persist.rehydrate()
  }, [])

  const goNext = useCallback(() => {
    const nextStep = steps[currentStepIndex + 1]
    if (nextStep) router.push(`/signup/${userType}/${nextStep.id}`)
  }, [currentStepIndex, steps, userType, router])

  const goBack = useCallback(() => {
    const prevStep = steps[currentStepIndex - 1]
    router.push(prevStep ? `/signup/${userType}/${prevStep.id}` : '/signup')
  }, [currentStepIndex, steps, userType, router])

  const value = useMemo(
    () => ({
      userType,
      currentStepIndex,
      formData,
      steps,
      setFormData,
      saveDraft,
      invalidateFrom,
      goNext,
      goBack,
    }),
    [
      userType,
      currentStepIndex,
      formData,
      steps,
      setFormData,
      saveDraft,
      invalidateFrom,
      goNext,
      goBack,
    ],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

export { OnboardingProvider, useOnboarding }
