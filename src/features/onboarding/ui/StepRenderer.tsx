'use client'

import { ProfileStep } from './ProfileStep'
import { InfoStep } from './InfoStep'
import { SurveyStep } from './SurveyStep'
import { KennelInfoStep } from './KennelInfoStep'
import { DocumentsStep } from './DocumentsStep'

const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  profile: ProfileStep,
  info: InfoStep,
  survey: SurveyStep,
  'kennel-info': KennelInfoStep,
  documents: DocumentsStep,
}

interface StepRendererProps {
  stepId: string
}

const StepRenderer = ({ stepId }: StepRendererProps) => {
  const StepComponent = STEP_COMPONENTS[stepId]

  if (!StepComponent) {
    return (
      <div className="flex flex-col items-center gap-[1rem] p-[1.25rem]">
        <p className="text-[#5d5d5d]">알 수 없는 단계입니다.</p>
      </div>
    )
  }

  return <StepComponent />
}

export { StepRenderer }
