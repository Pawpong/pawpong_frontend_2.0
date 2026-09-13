'use client'

import { Controller } from 'react-hook-form'
import { PixelSelectCard } from '@/shared/ui'
import { SKIP_ONBOARDING_VALIDATION } from '../model/devFlags'
import { useStepForm } from '../model/useStepForm'
import { animalSelectSchema } from '../model/schema'
import { StepContainer } from './StepContainer'

const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'lizard', label: '도마뱀' },
] as const

const AnimalSelectStep = () => {
  // 첫 단계라 goBack 은 /signup(유형 선택)으로 되돌린다 — 가입을 끝내는 게 아니라 앞 화면으로
  // 가는 것이라 라벨도 '이전'이다 ('그만두기'는 유형 선택 화면에서 홈으로 나갈 때 쓴다)
  const { control, handleSubmit, watch, onSubmit, firstErrorMessage, goBack } = useStepForm(
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
      navError={firstErrorMessage}
      nextDisabled={!SKIP_ONBOARDING_VALIDATION && !selected}
      layoutClassName="min-h-[calc(100dvh-3rem)] pb-0 tab:min-h-0"
      /* 카드 3장이 들어갈 폭만 확장하고, 영역 간격은 공통 STEP_LAYOUT을 따른다. */
      contentClassName="pb-0 tab:max-w-[48rem] tab:flex-none tab:pb-0 pc:max-w-[53rem]"
      navClassName="static right-auto bottom-auto left-auto z-auto mt-8 w-full pt-0 tab:mt-12 tab:pt-0"
    >
      {/* 동물 선택 카드 — 카드/간격 규격은 유형 선택(SignupTypeSelect)과 동일, spacing/48 */}
      <Controller
        name="selected"
        control={control}
        render={({ field }) => (
          <div className="flex w-full flex-col items-center gap-8 tab:flex-row tab:justify-center tab:gap-8 tab:px-4 pc:gap-12 pc:px-0">
            {ANIMAL_OPTIONS.map((animal) => (
              <PixelSelectCard
                key={animal.id}
                label={animal.label}
                selected={field.value === animal.id}
                onClick={() => field.onChange(animal.id)}
                illustration={{
                  src: `/images/onboarding/animal-${animal.id}-qa.svg`,
                  width: 50,
                  height: 50,
                }}
              />
            ))}
          </div>
        )}
      />
    </StepContainer>
  )
}

export { AnimalSelectStep }
