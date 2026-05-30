'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'
import { StepLayout } from '@/features/onboarding/ui/StepLayout'
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
      <div className="flex w-full items-center justify-center py-12">
        <h1
          className={cn(
            cafe24Proup.className,
            'text-center font-cafe24 text-[1.25rem] font-bold leading-[1.5] text-[#3e3e3e] tab:text-[1.5rem]',
          )}
        >
          회원유형을 선택해 주세요
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 tab:flex-row tab:gap-12">
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

      <div className="flex w-full flex-col items-center gap-5 py-8">
        <button
          type="button"
          onClick={handleNext}
          disabled={!selected}
          className="h-12 w-[16.125rem] rounded-full bg-[#fffa94] text-base font-semibold text-[#3e3e3e] transition-colors disabled:opacity-40"
        >
          다음
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-base font-medium text-[#3e3e3e]"
        >
          뒤로
        </button>
      </div>
    </StepLayout>
  )
}

export { SignupTypeSelect }
