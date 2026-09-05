'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepNavButtons } from './StepNavButtons'

const CompleteStep = () => {
  const router = useRouter()
  // 개인정보 입력값은 finishRegistration에서 이미 비웠다. 완료 표시는 새 소셜
  // 세션이 시작될 때 초기화한다. 이동 전에 지우면 아직 마운트된 가입 가드가
  // 미완료로 판단해 홈 이동과 경쟁하며 /signup으로 돌려보낸다.

  return (
    <StepLayout className="w-full flex-1">
      <StepTitle subtitle="포퐁에 오신걸 환영해요!">가입완료</StepTitle>

      {/* 이전 스텝과 동일: 콘텐츠 flex-1로 채워 nav 하단 고정, 모바일은 fixed nav 가림 방지용 pb */}
      <div className="flex w-full max-w-[40.625rem] flex-1 flex-col items-center justify-center px-4 pb-[7rem] tab:min-h-0 tab:px-0 tab:pb-12">
        <div className="h-[17.3125rem] w-[14.875rem] overflow-hidden rounded-2xl bg-[#8ed4ff] tab:w-[38.8125rem]">
          <Image
            src="/images/onboarding/onboarding-banner-small.svg"
            alt="가입완료 배너"
            width={238}
            height={277}
            className="size-full object-cover tab:hidden"
            priority
          />
          <Image
            src="/images/onboarding/onboarding-banner.svg"
            alt="가입완료 배너"
            width={621}
            height={277}
            className="hidden size-full object-cover tab:block"
            priority
          />
        </div>
      </div>

      <StepNavButtons
        onNext={() => {
          router.replace('/')
        }}
        nextLabel="홈으로"
        extraButtons={
          <Button variant="text" className="text-base font-medium tab:text-sm">
            문의하기
          </Button>
        }
      />
    </StepLayout>
  )
}

export { CompleteStep }
