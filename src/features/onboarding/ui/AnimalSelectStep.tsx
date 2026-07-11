'use client'

import { Controller } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'
import { useStepForm } from '../model/useStepForm'
import { animalSelectSchema, type AnimalSelectFormData, ANIMAL_TYPES } from '../model/schema'
import { StepContainer } from './StepContainer'

const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'lizard', label: '도마뱀' },
] as const

const AnimalSelectStep = () => {
  const { control, handleSubmit, watch, onSubmit, firstErrorMessage } =
    useStepForm<AnimalSelectFormData>('animal-select', animalSelectSchema, {
      selected: undefined as unknown as (typeof ANIMAL_TYPES)[number],
    })

  const selected = watch('selected')

  return (
    <StepContainer
      title="어떤 동물을 브리딩 하시나요?"
      onNext={() => handleSubmit(onSubmit)()}
      navError={firstErrorMessage}
      nextDisabled={!selected}
      layoutClassName="min-h-[calc(100dvh-3rem)] pb-0 tab:min-h-0"
      navClassName="static right-auto bottom-auto left-auto z-auto tab:mt-[4rem]"
    >
      {/* 동물 선택 카드 */}
      <Controller
        name="selected"
        control={control}
        render={({ field }) => (
          <div className="mt-[2rem] flex w-full flex-col items-center gap-[1.3125rem] px-[4.25rem] tab:mt-[6rem] tab:flex-row tab:justify-center tab:gap-[5.585rem] tab:px-0">
            {ANIMAL_OPTIONS.map((animal) => (
              <button
                key={animal.id}
                type="button"
                onClick={() => field.onChange(animal.id)}
                className={cn(
                  'flex h-[13.835rem] w-full items-center justify-center rounded-[0.569rem] bg-[#d9d9d9] tab:h-[17.38rem] tab:w-[18.765rem] tab:rounded-[0.715rem]',
                  field.value === animal.id && 'ring-2 ring-[#5d5d5d]',
                )}
              >
                <span className="text-[1.423rem] font-bold text-black tab:text-[1.787rem]">
                  {animal.label}
                </span>
              </button>
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
