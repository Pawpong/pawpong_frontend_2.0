'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, PixelSelectCard } from '@/shared/ui'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
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
    if (!selected) return

    // 가입은 소셜 tempId 가 있어야 진행된다. 세션 없이 유형만 고르면 다음 화면의 라우트 가드가
    // 다시 여기로 돌려보내 무한 반복이 되므로, 그 전에 로그인으로 보낸다.
    if (!loadSocialSignupSession()?.tempId) {
      router.replace('/login')
      return
    }

    router.push(`/signup/${selected}`)
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
        // router.back() 은 방금 떠나온 다음 단계로 되감긴다 — 가입을 그만두는 것이므로 홈으로 보낸다
        onBack={() => router.push('/')}
        backLabel="그만두기"
        nextDisabled={!selected}
      />
    </StepLayout>
  )
}

export { SignupTypeSelect }
