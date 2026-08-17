'use client'

import { Controller } from 'react-hook-form'
import { PixelSelectCard } from '@/shared/ui'
import { useStepForm } from '../model/useStepForm'
import { animalSelectSchema } from '../model/schema'
import { StepContainer } from './StepContainer'

// artWidth: 픽셀 일러스트 원본 가로 (Figma animal md). 강아지만 94 라 비율 보존에 필요
const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이', artWidth: 88 },
  { id: 'dog', label: '강아지', artWidth: 94 },
  { id: 'lizard', label: '도마뱀', artWidth: 88 },
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
      contentClassName="tab:max-w-[52.9693rem] tab:gap-[10.5128rem]"
      navClassName="static right-auto bottom-auto left-auto z-auto tab:mt-[4rem]"
    >
      {/* 동물 선택 카드 — 카드/간격 규격은 유형 선택(SignupTypeSelect)과 동일, spacing/48 */}
      <Controller
        name="selected"
        control={control}
        render={({ field }) => (
          <div className="flex w-full flex-col items-center gap-8 tab:flex-row tab:justify-center tab:gap-12">
            {ANIMAL_OPTIONS.map((animal) => (
              <PixelSelectCard
                key={animal.id}
                label={animal.label}
                selected={field.value === animal.id}
                onClick={() => field.onChange(animal.id)}
                illustration={{
                  defaultSrc: `/images/onboarding/animal-${animal.id}-gray.svg`,
                  activeSrc: `/images/onboarding/animal-${animal.id}.svg`,
                  width: animal.artWidth,
                  height: 100,
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
