'use client'

import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { useOnboarding } from '../model/OnboardingContext'

const FILL_START = 10.4868
const FILL_END = 544.113
const FILL_WIDTH = FILL_END - FILL_START

interface ProgressBarSvgProps {
  percent: number
}

const ProgressBarSvg = ({ percent }: ProgressBarSvgProps) => {
  const clampedPercent = Math.min(100, Math.max(0, percent))
  const fillEndX = FILL_START + (clampedPercent / 100) * FILL_WIDTH

  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: 'block' }}
      viewBox="0 0 557.533 26.3097"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`진행률 ${clampedPercent}%`}
    >
      {/* 외곽 테두리 (갈색) */}
      <path
        d="M544.111 3.95215H550.517V11.0586H557.533V26.3096H10.4873V22.3887H6.33594V19.9414H0V11.0586H6.33594V3.95215H10.457V0H544.111V3.95215Z"
        fill="#A9835A"
      />
      {/* 배경 (노란색) */}
      <path
        d="M544.112 3.94877V11.0591H550.517V19.7388H6.33601V11.0591H10.4493V3.94877H544.112Z"
        fill="#FFFA94"
      />
      {/* 배경 하단 그림자 */}
      <path d="M550.517 19.7384H10.4869V22.3889H550.517V19.7384Z" fill="#D9BD44" />
      {/* 내부 흰색 영역 */}
      <path d="M544.113 9.25621H14.5593V19.7384H544.113V9.25621Z" fill="white" />
      {/* 녹색 채움 (진행률) */}
      {clampedPercent > 0 && (
        <>
          <rect
            x={FILL_START}
            y={9.25618}
            width={fillEndX - FILL_START}
            height={10.48222}
            fill="#39D264"
          />
          <rect
            x={FILL_START}
            y={9.25618}
            width={fillEndX - FILL_START}
            height={4.02742}
            fill="#74F08E"
          />
        </>
      )}
    </svg>
  )
}

const StepProgressBar = () => {
  const { currentStepIndex, steps } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  const progressPercent = Math.round(((currentStepIndex + 1) / (visibleSteps.length + 1)) * 100)

  return (
    <div className="flex w-full items-center justify-center bg-white px-4 py-1 tab:px-12 tab:py-2 pc:px-20">
      <div className="flex w-full items-center justify-center gap-[0.125rem]">
        <div
          className={cn(
            cafe24Proup.className,
            'flex flex-col items-center font-cafe24 text-[0.625rem] leading-[1.5] font-bold tab:text-[0.875rem]',
          )}
        >
          <span className="-mb-[0.3125rem] text-[#a9835a]">EXP</span>
          <span className="text-[#39d264]">{progressPercent}%</span>
        </div>
        <div className="relative px-2 py-[0.125rem]">
          <div className="h-[0.829rem] w-full max-w-[17.562rem] tab:h-[1.644rem] tab:max-w-[34.846rem]">
            <ProgressBarSvg percent={progressPercent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { StepProgressBar }
