'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import styles from './OnboardingChoice.module.css'

interface OnboardingChoiceProps {
  label: string
  description?: string
  image: string
  selected: boolean
  onClick: () => void
}

const OnboardingChoice = ({
  label,
  description,
  image,
  selected,
  onClick,
}: OnboardingChoiceProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      styles.card,
      'relative flex w-full min-w-0 items-center gap-5 p-5 text-left focus-ring tab:flex-col tab:gap-5 tab:p-7 tab:text-center',
    )}
  >
    {/* 배경 틀 없이 그림만 크게 (모바일 96 / tab+ 144) */}
    <Image
      src={image}
      alt=""
      width={144}
      height={144}
      className="size-24 shrink-0 object-contain [image-rendering:pixelated] tab:mt-3 tab:size-36"
    />
    <span className="flex min-w-0 flex-1 flex-col gap-2 pr-6 tab:pr-0">
      <span className="font-cafe24 text-body-xl text-primary-800">{label}</span>
      {description && (
        // 설명 안의 \n 은 그 자리에서 줄을 바꾼다
        <span className="text-body-md leading-relaxed break-keep whitespace-pre-line text-neutral-700">
          {description}
        </span>
      )}
    </span>
    <span
      aria-hidden
      className={cn(
        'absolute top-5 right-5 grid size-5 place-items-center border-2',
        selected
          ? 'border-primary-500 bg-primary-500 text-point-100'
          : 'border-primary-200 bg-secondary-50',
      )}
    >
      {selected && (
        <svg viewBox="0 0 12 12" className="size-3" fill="currentColor">
          <path d="M1 5h2v2h2V5h2V3h2V1h2v4H9v2H7v2H5v2H3V9H1Z" />
        </svg>
      )}
    </span>
  </button>
)

export { OnboardingChoice }
