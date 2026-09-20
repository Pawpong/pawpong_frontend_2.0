'use client'

import { Fragment, useLayoutEffect, useRef } from 'react'
import { PixelTab, type PixelTabStatus } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useOnboarding } from '../model/OnboardingContext'

const CHIP_CLASS_NAME =
  'h-[2.125rem] w-[6.640625rem] p-1 tab:h-[2.125rem] tab:w-[6.640625rem] pc:h-[3.837rem] pc:w-[11.991rem] pc:p-2'
const LABEL_CLASS_NAME = 'text-[0.625rem] tab:text-[0.625rem] pc:text-base'
const ARROW_CLASS_NAME = 'size-[0.875rem] tab:size-[0.875rem] pc:size-8'

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()
  const viewportRef = useRef<HTMLDivElement>(null)
  const activeStepRef = useRef<HTMLSpanElement>(null)

  const visibleSteps = steps.filter((step) => step.id !== 'complete')

  const statusOf = (index: number): PixelTabStatus =>
    index < currentStepIndex ? 'default' : index === currentStepIndex ? 'active' : 'disabled'

  // tab 구간에서는 큰 탭이 영역을 넘을 수 있어 현재 단계가 보이도록 가운데로 맞춘다.
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
      aria-label="회원가입 진행 단계"
      className="hidden w-full max-w-full min-w-0 self-stretch tab:block pc:w-auto pc:max-w-none pc:self-auto"
    >
      {/* tab+(768~): 한 줄 유지, 다 안 들어오면 현재 단계가 보이도록 가로 스크롤. 모바일은 표시하지 않는다. */}
      <div
        ref={viewportRef}
        className="tab:overflow-x-auto tab:overscroll-x-contain pc:overflow-visible"
      >
        <div className="flex w-max min-w-full items-center justify-center gap-1">
          {visibleSteps.map((step, index) => (
            <Fragment key={step.id}>
              {index > 0 && (
                <OnboardingArrow
                  className={cn(
                    ARROW_CLASS_NAME,
                    index <= currentStepIndex ? 'text-primary-500' : 'text-neutral-400',
                  )}
                />
              )}
              <span
                ref={index === currentStepIndex ? activeStepRef : undefined}
                className="shrink-0"
              >
                <PixelTab
                  compactTablet
                  label={step.label}
                  className={CHIP_CLASS_NAME}
                  labelClassName={LABEL_CLASS_NAME}
                  pawClassName="flex"
                  status={statusOf(index)}
                />
              </span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 픽셀 화살표 (Figma 924-21749 arrow-onboarding).
 * 아트(12.331x19.73)는 박스 정중앙에 놓인다 — 박스는 mo·tab 14 / pc 32.
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
