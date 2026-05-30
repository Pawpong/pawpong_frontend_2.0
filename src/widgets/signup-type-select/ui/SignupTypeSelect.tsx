'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/features/onboarding/ui/StepLayout'
import { StepTitle } from '@/features/onboarding/ui/StepTitle'
import { StepNavButtons } from '@/features/onboarding/ui/StepNavButtons'
import { UserTypeCard } from './UserTypeCard'

const USER_TYPE_OPTIONS = [
  {
    value: 'general' as const,
    label: '일반',
    imageSrc: '/images/onboarding/btn-pixel-general.svg',
    textColor: 'text-[#a9835a]',
  },
  {
    value: 'breeder' as const,
    label: '브리더',
    imageSrc: '/images/onboarding/btn-pixel-breeder.svg',
    textColor: 'text-[#6b6b6b]',
  },
]

type UserType = 'general' | 'breeder'

const SignupTypeSelect = () => {
  const router = useRouter()
  const [selected, setSelected] = useState<UserType | null>(null)

  const handleNext = () => {
    if (selected) {
      router.push(`/signup/${selected}`)
    }
  }

  return (
    <StepLayout className="flex-1">
      <StepTitle>회원유형을 선택해 주세요</StepTitle>

      <div className="flex w-full max-w-[40.625rem] tab:flex-row flex-1 flex-col items-center justify-center gap-8 px-4 py-12 tab:gap-[3.625rem] tab:py-12">
        {USER_TYPE_OPTIONS.map((option) => (
          <UserTypeCard
            key={option.value}
            label={option.label}
            imageSrc={option.imageSrc}
            textColor={option.textColor}
            selected={selected === option.value}
            onClick={() => setSelected(option.value)}
          />
        ))}
      </div>

      <StepNavButtons
        onNext={handleNext}
        onBack={() => router.back()}
        nextDisabled={!selected}
      />
    </StepLayout>
  )
}

export { SignupTypeSelect }
