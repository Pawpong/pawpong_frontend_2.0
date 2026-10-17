'use client'

import { Controller } from 'react-hook-form'
import { OnboardingChoice } from './OnboardingChoice'
import { SKIP_ONBOARDING_VALIDATION } from '../model/devFlags'
import { useStepForm } from '../model/useStepForm'
import { animalSelectSchema } from '../model/schema'
import { StepContainer } from './StepContainer'
import { FieldError } from './FieldError'

const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'lizard', label: '도마뱀' },
] as const

const AnimalSelectStep = () => {
  // 첫 단계라 goBack 은 /signup(유형 선택)으로 되돌린다 — 가입을 끝내는 게 아니라 앞 화면으로
  // 가는 것이라 라벨도 '이전'이다 ('그만두기'는 유형 선택 화면에서 홈으로 나갈 때 쓴다)
  const { control, handleSubmit, watch, onSubmit, goBack } = useStepForm(
    'animal-select',
    animalSelectSchema,
    {},
  )

  const selected = watch('selected')

  return (
    <StepContainer
      title="어떤 동물을 브리딩 하시나요?"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      backLabel="이전"
      nextDisabled={!SKIP_ONBOARDING_VALIDATION && !selected}
      subtitle="주로 브리딩하는 동물 한 종류를 선택해주세요."
      contentClassName="border-0 bg-transparent p-0 tab:p-0"
    >
      {/* 동물 선택 카드 — 카드/간격 규격은 유형 선택(SignupTypeSelect)과 동일, spacing/48 */}
      <Controller
        name="selected"
        control={control}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <div className="grid w-full gap-3 tab:grid-cols-3">
              {ANIMAL_OPTIONS.map((animal) => (
                <OnboardingChoice
                  key={animal.id}
                  label={animal.label}
                  selected={field.value === animal.id}
                  onClick={() => field.onChange(animal.id)}
                  image={`/images/onboarding/animal-${animal.id}-v3.png`}
                />
              ))}
            </div>
            <FieldError message={fieldState.error?.message} />
          </div>
        )}
      />
    </StepContainer>
  )
}

export { AnimalSelectStep }
