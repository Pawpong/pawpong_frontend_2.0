'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, PixelSelectCard } from '@/shared/ui'
import {
  StepLayout,
  StepNavButtons,
  StepTitle,
  USER_TYPE_OPTIONS,
  type UserType,
} from '@/features/onboarding'

const SignupTypeSelect = () => {
  const router = useRouter()
  // 초기 선택 없음 — 카드 상태(default/hover/active)는 PixelSelectCard가 담당
  const [selected, setSelected] = useState<UserType | null>(null)

  const handleNext = () => {
    if (selected) {
      router.push(`/signup/${selected}`)
    }
  }

  return (
    <StepLayout className="flex-1">
      <StepTitle>회원유형을 선택해 주세요</StepTitle>

      {/* Figma 온보딩1: 모바일 세로 28px 간격, 태블릿 383px 영역 중앙, PC 514px 영역 상단. */}
      <Container className="flex flex-col items-center px-4 pt-5 pb-12 tab:min-h-[23.9375rem] tab:justify-center pc:min-h-[32.125rem] pc:justify-start pc:pt-7">
        <div className="flex w-full max-w-[40.625rem] flex-col items-center justify-center gap-7 tab:flex-row pc:gap-12">
          {USER_TYPE_OPTIONS.map((option) => (
            <PixelSelectCard
              key={option.value}
              label={option.label}
              selected={selected === option.value}
              onClick={() => setSelected(option.value)}
            />
          ))}
        </div>
      </Container>

      <StepNavButtons
        className="static w-full"
        onNext={handleNext}
        onBack={() => router.back()}
        backLabel="그만두기"
        nextDisabled={!selected}
      />
    </StepLayout>
  )
}

export { SignupTypeSelect }
