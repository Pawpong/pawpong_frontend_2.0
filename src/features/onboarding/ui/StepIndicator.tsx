'use client'

import { Fragment, useLayoutEffect, useRef } from 'react'
import { PixelTab } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useOnboarding } from '../model/OnboardingContext'

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLSpanElement>(null)

  const visibleSteps = steps.filter((step) => step.id !== 'complete')

  // tab 구간에서는 큰 탭이 영역을 넘을 수 있어 현재 단계가 보이도록 가운데로 맞춘다.
  // 모바일은 아래에서 탭을 균등 분배하므로 스크롤 없이 전체 단계가 한 번에 노출된다.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const activeStep = activeStepRef.current
    if (!viewport || !activeStep) return

    const centeredLeft = activeStep.offsetLeft - (viewport.clientWidth - activeStep.offsetWidth) / 2
    viewport.scrollLeft = Math.max(
      0,
      Math.min(centeredLeft, viewport.scrollWidth - viewport.clientWidth),
    )
  }, [currentStepIndex, visibleSteps.length])

  return (
    <div
      ref={viewportRef}
      aria-label="회원가입 진행 단계"
      className="w-full max-w-full min-w-0 self-stretch overflow-x-hidden overflow-y-hidden tab:overflow-x-auto tab:overscroll-x-contain pc:w-auto pc:max-w-none pc:self-auto pc:overflow-visible"
    >
      {/* 칩·화살표 간격 spacing/4 (Figma 3124-328220) */}
      <div className="flex w-full min-w-0 items-center justify-center gap-0.5 px-px tab:w-max tab:min-w-full tab:gap-1">
        {visibleSteps.map((step, index) => (
          <Fragment key={step.id}>
            {index > 0 && (
              // 지나온 구간은 갈색(active), 아직 안 온 구간은 회색(inactive)
              <OnboardingArrow
                className={cn(
                  'size-2 tab:size-6',
                  index <= currentStepIndex ? 'text-primary-500' : 'text-neutral-400',
                )}
              />
            )}
            <span
              ref={index === currentStepIndex ? activeStepRef : undefined}
              className="min-w-0 flex-1 tab:flex-none tab:shrink-0"
            >
              <PixelTab
                label={step.label}
                className="w-full min-w-0 p-0.5 tab:w-[11.991rem] tab:p-2"
                labelClassName="text-[0.5rem] tab:text-base"
                pawClassName="hidden tab:flex"
                status={
                  index < currentStepIndex
                    ? 'default'
                    : index === currentStepIndex
                      ? 'active'
                      : 'disabled'
                }
              />
            </span>
          </Fragment>
        ))}
      </div>
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
