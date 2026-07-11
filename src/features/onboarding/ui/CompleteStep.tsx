'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepNavButtons } from './StepNavButtons'

const CompleteStep = () => {
  const router = useRouter()

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
        onNext={() => router.push('/')}
        nextLabel="다음"
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
