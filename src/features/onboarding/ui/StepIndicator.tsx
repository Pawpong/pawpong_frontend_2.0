'use client'

import { Fragment } from 'react'
import { PixelTab } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useOnboarding } from '../model/OnboardingContext'

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')

  return (
    // 칩·화살표 간격 spacing/4 (Figma 3124-328220)
    <div className="flex items-center gap-1">
      {visibleSteps.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && (
            // 지나온 구간은 갈색(active), 아직 안 온 구간은 회색(inactive)
            <OnboardingArrow
              className={index <= currentStepIndex ? 'text-primary-500' : 'text-neutral-400'}
            />
          )}
          <PixelTab
            label={step.label}
            status={
              index < currentStepIndex
                ? 'default'
                : index === currentStepIndex
                  ? 'active'
                  : 'disabled'
            }
          />
        </Fragment>
      ))}
    </div>
  )
}

/**
 * 픽셀 화살표 (Figma 924-21749 arrow-onboarding).
 * 아트(12.331x19.73)는 박스 정중앙에 놓인다 — 박스는 mo 14 / tab+ 32.
 * 정사각 5칸이 계단으로 겹쳐 꺾이는 모양이라 칸 크기를 바꾸면 픽셀 결이 깨진다.
 */
const OnboardingArrow = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={cn('size-2.5 shrink-0 tab:size-6', className)}
    viewBox="0 0 32 32"
    fill="none"
  >
    <g fill="currentColor" transform="translate(9.834 6.135)">
      <path d="M4.93242 0H0V4.93242H4.93242V0Z" />
      <path d="M8.63174 3.69932H3.69932V8.63174H8.63174V3.69932Z" />
      <path d="M12.3311 7.39863H7.39863V12.3311H12.3311V7.39863Z" />
      <path d="M8.63174 11.098H3.69932V16.0304H8.63174V11.098Z" />
      <path d="M4.93242 14.7973H0V19.7297H4.93242V14.7973Z" />
    </g>
  </svg>
)

export { StepIndicator }
