'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, PixelSelectCard } from '@/shared/ui'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
import {
  SKIP_ONBOARDING_VALIDATION,
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
    /* 상단 정렬 — 제목·카드·버튼을 한 덩어리로 위에서부터 쌓는다.
       가운데 정렬은 화면이 길수록 위아래 공백이 같이 커져 다른 스텝과 시작 위치가 어긋났다. */
    <StepLayout className="flex-1 gap-10 pt-14 pb-10 tab:gap-16 tab:pt-20">
      <StepTitle className="py-0 tab:py-0">회원유형을 선택해 주세요</StepTitle>

      <Container className="flex flex-col items-center px-4">
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
        className="static w-full pt-0 pb-0"
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
