'use client'

import { ProfileStep } from './ProfileStep'
import { InfoStep } from './InfoStep'
import { SurveyStep } from './SurveyStep'
import { AnimalSelectStep } from './AnimalSelectStep'
import { KennelInfoStep } from './KennelInfoStep'
import { DocumentsStep } from './DocumentsStep'
import { CompleteStep } from './CompleteStep'
import type { StepId } from '../model/types'

const STEP_COMPONENTS = {
  'animal-select': AnimalSelectStep,
  profile: ProfileStep,
  info: InfoStep,
  survey: SurveyStep,
  'kennel-info': KennelInfoStep,
  documents: DocumentsStep,
  complete: CompleteStep,
} satisfies Record<StepId, React.ComponentType>

interface StepRendererProps {
  stepId: StepId
}

// [refactored] 없는 스텝 폴백 제거 — [step]/page.tsx 가 이미 notFound() 로 걸러낸다
const StepRenderer = ({ stepId }: StepRendererProps) => {
  const StepComponent = STEP_COMPONENTS[stepId]

  return <StepComponent />
}

export { StepRenderer }
