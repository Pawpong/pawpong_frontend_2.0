'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/shared/lib/Cn'
import { useOnboarding } from '../model/OnboardingContext'
import { animalSelectSchema, type AnimalSelectFormData, ANIMAL_TYPES } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepNavButtons } from './StepNavButtons'

const ANIMAL_OPTIONS = [
  { id: 'cat', label: '고양이' },
  { id: 'dog', label: '강아지' },
  { id: 'lizard', label: '도마뱀' },
] as const

const AnimalSelectStep = () => {
  const { goNext, formData, setFormData } = useOnboarding()

  const { control, handleSubmit, watch } = useForm<AnimalSelectFormData>({
    resolver: zodResolver(animalSelectSchema),
    defaultValues: (formData['animal-select'] as AnimalSelectFormData) ?? {
      selected: undefined as unknown as (typeof ANIMAL_TYPES)[number],
    },
  })

  const selected = watch('selected')

  const onSubmit = (data: AnimalSelectFormData) => {
    setFormData('animal-select', data as unknown as Record<string, unknown>)
    goNext()
  }

  return (
    <StepLayout className="min-h-[calc(100dvh-3rem)] pb-0 tab:min-h-0">
      <StepTitle>어떤 동물을 브리딩 하시나요?</StepTitle>

      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

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

      <StepNavButtons
        onNext={() => handleSubmit(onSubmit)()}
        nextDisabled={!selected}
        className="static bottom-auto left-auto right-auto z-auto tab:mt-[4rem]"
      />
    </StepLayout>
  )
}

export { AnimalSelectStep }
