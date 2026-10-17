'use client'

import { useOnboarding } from '../model/OnboardingContext'
import { OnboardingProgressBar } from './StepProgressBar'

const StepIndicator = () => {
  const { steps, currentStepIndex, userType } = useOnboarding()
  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  return (
    <nav aria-label="회원가입 진행 단계" className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 text-body-md text-primary-700">
        <span>{userType === 'breeder' ? '브리더 회원가입' : '일반 회원가입'}</span>
        <span aria-current="step">
          {currentStepIndex + 1} / {visibleSteps.length} · {visibleSteps[currentStepIndex]?.label}
        </span>
      </div>
      <OnboardingProgressBar
        percent={Math.round(((currentStepIndex + 1) / (visibleSteps.length + 1)) * 100)}
      />
    </nav>
  )
}

export { StepIndicator }
