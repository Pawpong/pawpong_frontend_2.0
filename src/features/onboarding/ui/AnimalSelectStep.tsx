'use client'

import { Controller } from 'react-hook-form'
import { PixelSelectCard } from '@/shared/ui'
import { useStepForm } from '../model/useStepForm'
import { animalSelectSchema } from '../model/schema'
import { StepContainer } from './StepContainer'

const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'lizard', label: '도마뱀' },
] as const

const AnimalSelectStep = () => {
  // 첫 단계라 goBack 은 /signup(유형 선택)으로 되돌린다 — 라벨이 '그만두기'인 이유
  const { control, handleSubmit, watch, onSubmit, firstErrorMessage, goBack } = useStepForm(
    'animal-select',
    animalSelectSchema,
    {},
  )

  const selected = watch('selected')

  return (
    <StepContainer
      title="어떤 동물을 브리딩 하시나요?"
      subtitle="한 가지를 선택해주세요."
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      backLabel="그만두기"
      navError={firstErrorMessage}
      nextDisabled={!selected}
      layoutClassName="min-h-[calc(100dvh-3rem)] pb-0 tab:min-h-0"
      /* 카드 3장 = 250.503*3 + gap 48*2 = 847.5px (기본 650px 로는 좁다).
         단계 칩 하단 -> 카드 상단 168.2px (Figma 3134-344275) */
      contentClassName="pb-0 tab:max-w-[48rem] tab:flex-none tab:gap-7 tab:pb-0 pc:max-w-[52.9693rem] pc:gap-[10.5128rem] pc:pb-12"
      navClassName="static right-auto bottom-auto left-auto z-auto w-full pc:mt-[4rem]"
    >
      {/* 동물 선택 카드 — 카드/간격 규격은 유형 선택(SignupTypeSelect)과 동일, spacing/48 */}
      <Controller
        name="selected"
        control={control}
        render={({ field }) => (
          <div className="flex w-full flex-col items-center gap-8 tab:min-h-[23.9375rem] tab:flex-row tab:justify-center tab:gap-7 tab:px-4 tab:pt-5 tab:pb-12 pc:min-h-0 pc:gap-12 pc:p-0">
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

      {/* 스페이서 (mo) */}
      <div className="flex-1 tab:hidden" />
    </StepContainer>
  )
}

export { AnimalSelectStep }
