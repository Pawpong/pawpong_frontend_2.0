'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/shared/ui'
import { StepLayout } from '@/features/onboarding/ui/StepLayout'
import { StepTitle } from '@/features/onboarding/ui/StepTitle'
import { StepNavButtons } from '@/features/onboarding/ui/StepNavButtons'
import { UserTypeCard } from './UserTypeCard'

const USER_TYPE_OPTIONS = [
  { value: 'general' as const, label: '일반' },
  { value: 'breeder' as const, label: '브리더' },
]

// [refactored] 옵션 배열에서 타입 파생 — 옵션 추가 시 단일 지점 수정
type UserType = (typeof USER_TYPE_OPTIONS)[number]['value']

const SignupTypeSelect = () => {
  const router = useRouter()
  // 초기 선택 없음 — 카드 상태(default/hover/active)는 UserTypeCard가 담당
  const [selected, setSelected] = useState<UserType | null>(null)

  const handleNext = () => {
    if (selected) {
      router.push(`/signup/${selected}`)
    }
  }

  return (
    <StepLayout className="flex-1">
      <StepTitle>회원유형을 선택해 주세요</StepTitle>

      {/* 카드 영역 — 공통 Container + 세로 spacing/48 / 가로 margin: mo 16(기본 20 오버라이드)·tab 48·pc 80 (Figma 966-11748) */}
      <Container className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[40.625rem] flex-col items-center justify-center gap-8 tab:flex-row tab:gap-12">
          {USER_TYPE_OPTIONS.map((option) => (
            <UserTypeCard
              key={option.value}
              label={option.label}
              selected={selected === option.value}
              onClick={() => setSelected(option.value)}
            />
          ))}
        </div>
      </Container>

      <StepNavButtons
        onNext={handleNext}
        onBack={() => router.back()}
        backLabel="그만두기"
        nextDisabled={!selected}
      />
    </StepLayout>
  )
}

export { SignupTypeSelect }
