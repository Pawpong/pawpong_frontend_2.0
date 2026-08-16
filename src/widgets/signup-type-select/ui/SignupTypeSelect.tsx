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

      {/* 카드 영역 — 공통 Container + 세로 spacing/28·48 / 가로 margin: mo 16(기본 20 오버라이드)·tab 48·pc 80 */}
      {/* flex-1 을 두지 않는다: 카드 높이만큼만 차지해 하단 버튼이 카드 바로 아래 붙고,
          남는 높이는 버튼 아래로 흐른다 (Figma 3406-741726) */}
      <Container className="flex flex-col items-center px-4 pt-7 pb-12">
        <div className="flex w-full max-w-[40.625rem] flex-col items-center justify-center gap-8 tab:flex-row tab:gap-12">
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
        onNext={handleNext}
        onBack={() => router.back()}
        backLabel="그만두기"
        nextDisabled={!selected}
      />
    </StepLayout>
  )
}

export { SignupTypeSelect }
