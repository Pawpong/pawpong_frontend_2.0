'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepNavButtons } from './StepNavButtons'

const CompleteStep = () => {
  const router = useRouter()
  // 개인정보 입력값은 finishRegistration에서 이미 비웠다. 완료 표시는 새 소셜
  // 세션이 시작될 때 초기화한다. 이동 전에 지우면 아직 마운트된 가입 가드가
  // 미완료로 판단해 홈 이동과 경쟁하며 /signup으로 돌려보낸다.

  return (
    <StepLayout className="mx-auto w-full max-w-3xl flex-1 page-gutter-x pt-8">
      <StepTitle subtitle="포퐁에 오신 걸 환영해요. 이제 새로운 만남을 시작해보세요.">
        가입이 완료되었어요
      </StepTitle>

      <div className={cn('flex flex-col items-center py-6', STEP_LAYOUT.content)}>
        <div className="h-[17.3125rem] w-full overflow-hidden rounded-2xl bg-secondary-100">
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
      />
    </StepLayout>
  )
}

export { CompleteStep }
