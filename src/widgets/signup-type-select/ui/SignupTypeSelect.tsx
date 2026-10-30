'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
import {
  SKIP_ONBOARDING_VALIDATION,
  OnboardingChoice,
  OnboardingProgressBar,
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
    // (화면 작업용 스위치가 켜져 있으면 라우트 가드도 꺼져 있어 반복이 생기지 않는다 — devFlags 참고)
    if (!SKIP_ONBOARDING_VALIDATION && !loadSocialSignupSession()?.tempId) {
      router.replace('/login')
      return
    }

    router.push(`/signup/${selected}`)
  }

  return (
    <StepLayout className="flex-1">
      <OnboardingProgressBar percent={0} />
      <StepTitle subtitle="어떤 만남을 위해 오셨나요? 나에게 맞는 회원 유형을 선택해주세요.">
        회원 유형을 선택해주세요
      </StepTitle>
      <div className="grid w-full gap-4 tab:grid-cols-2">
        {USER_TYPE_OPTIONS.map((option) => (
          <OnboardingChoice
            key={option.value}
            label={option.label}
            description={
              option.value === 'breeder'
                ? '정성껏 돌본 아이들에게\n좋은 가족을 찾아주고 싶어요.'
                : '나와 함께할 반려동물을 만나고,\n일상을 나누고 싶어요.'
            }
            image={`/images/onboarding/member-${option.value}-v3.png`}
            selected={selected === option.value}
            onClick={() => setSelected(option.value)}
          />
        ))}
      </div>
      <p className="mt-5 mb-8 w-full text-body-md text-neutral-700">
        브리더 회원은 활동 정보와 인증 서류를 함께 등록할 수 있어요.
      </p>

      <StepNavButtons
        nextLabel={
          selected === 'breeder'
            ? '브리더로 시작하기'
            : selected === 'general'
              ? '일반 회원으로 시작하기'
              : '회원 유형을 선택해주세요'
        }
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
