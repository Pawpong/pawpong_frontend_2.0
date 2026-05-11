'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type UserType, ONBOARDING_STEPS } from './types'

interface OnboardingState {
  userType: UserType
  currentStepIndex: number
  formData: Record<string, unknown>
  steps: typeof ONBOARDING_STEPS.general
  totalSteps: number
  currentStepId: string
  isFirstStep: boolean
  isLastStep: boolean
  setFormData: (stepId: string, data: Record<string, unknown>) => void
  goNext: () => void
  goBack: () => void
}

const OnboardingContext = createContext<OnboardingState | null>(null)

interface OnboardingProviderProps {
  userType: UserType
  initialStepIndex?: number
  children: React.ReactNode
}

const OnboardingProvider = ({
  userType,
  initialStepIndex = 0,
  children,
}: OnboardingProviderProps) => {
  const router = useRouter()
  const steps = ONBOARDING_STEPS[userType]
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex)
  const [formData, setFormDataState] = useState<Record<string, unknown>>({})

  const setFormData = useCallback((stepId: string, data: Record<string, unknown>) => {
    setFormDataState((prev) => ({ ...prev, [stepId]: data }))
  }, [])

  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1]
      setCurrentStepIndex((prev) => prev + 1)
      router.push(`/signup/${userType}/${nextStep.id}`)
    }
  }, [currentStepIndex, steps, userType, router])

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1]
      setCurrentStepIndex((prev) => prev - 1)
      router.push(`/signup/${userType}/${prevStep.id}`)
    } else {
      router.push('/signup')
    }
  }, [currentStepIndex, steps, userType, router])

  const value = useMemo(
    () => ({
      userType,
      currentStepIndex,
      formData,
      steps,
      totalSteps: steps.length,
      currentStepId: steps[currentStepIndex].id,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === steps.length - 1,
      setFormData,
      goNext,
      goBack,
    }),
    [userType, currentStepIndex, formData, steps, setFormData, goNext, goBack],
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
