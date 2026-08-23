'use client'

import { tv } from 'tailwind-variants'
import { PawPrintIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

/**
 * (home)tab-btn 프레임 (Figma 2752-262504).
 * 상태별 에셋 4장은 테두리 path 가 완전히 동일하고 색만 달라 인라인 path 로 합쳤다.
 * 테두리는 매 상태 글자와 같은 색이라 currentColor 로 따라간다.
 * mo(md 106.25x34) 와 tab+(lg 191.854x61.394) 는 픽셀 계단 수가 달라 아트가 별개다.
 */
const MD_BORDER =
  'M93.5 4.25H102V8.5H106.25V34H8.5V29.75H4.25V23.375H0V8.5H4.25V4.25H12.75V0H93.5V4.25Z'
const MD_FILL = 'M12.75 23.375H4.25V8.5H12.75V4.25H93.5V8.5H102V23.375H93.5V27.625H12.75V23.375Z'
const LG_BORDER =
  'M184.181 15.3486H191.854V61.3936H15.3486V53.7197H7.6748V42.208H0V15.3486H7.6748V7.6748H184.181V15.3486ZM168.832 7.67383H23.0225V0H168.832V7.67383Z'
const LG_FILL =
  'M23.0225 42.208H7.6748V15.3486H23.0225V7.6748H168.832V15.3486H184.181V42.208H168.832V49.8818H23.0225V42.208Z'

const pixelTab = tv({
  slots: {
    root: 'relative flex h-[2.125rem] w-[6.641rem] shrink-0 items-center justify-center p-2 tab:h-[3.837rem] tab:w-[11.991rem]',
    fill: '',
  },
  variants: {
    status: {
      default: { root: 'text-primary-500', fill: 'fill-point-100' },
      unactive: { root: 'text-secondary-500', fill: 'fill-point-100' },
      active: { root: 'text-primary-500', fill: 'fill-point-500' },
      disabled: { root: 'text-neutral-400', fill: 'fill-neutral-50' },
    },
  },
  defaultVariants: { status: 'default' },
})

type PixelTabStatus = 'default' | 'unactive' | 'active' | 'disabled'

interface PixelTabProps {
  label: string
  status?: PixelTabStatus
}

const PixelTab = ({ label, status }: PixelTabProps) => {
  const styles = pixelTab({ status })

  return (
    <span className={styles.root()}>
      <svg
        viewBox="0 0 106.25 34"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full tab:hidden"
      >
        <path d={MD_BORDER} fill="currentColor" />
        <path d={MD_FILL} className={styles.fill()} />
      </svg>
      <svg
        viewBox="0 0 191.854 61.3936"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 hidden size-full tab:block"
      >
        <path d={LG_BORDER} fill="currentColor" />
        <path d={LG_FILL} className={styles.fill()} />
      </svg>

      {/* 발바닥은 active 에만. 칩이 고정 폭이라 라벨이 길면 글자 끝에 겹치는데,
          시안(2752-262504)이 그대로 겹쳐 두므로 칩 기준 절대 위치를 쓴다.
          icon/paw 박스 32 정사각 = 칩의 16.68%, 그 안에서 글리프 22.018 = 68.8% (카드와 동일 비율).
          박스 중심은 시안 컨테이너(128, 8.84 / 43.713)의 중심 (149.86, 30.70) = (78.11%, 50%) */}
      {status === 'active' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-[78.11%] flex aspect-square w-[16.68%] -translate-x-1/2 -translate-y-1/2 rotate-30 items-center justify-center text-secondary-500"
        >
          <PawPrintIcon className="h-auto w-[68.8%]" />
        </span>
      )}

      <span
        className={cn(
          cafe24Proup.className,
          'relative font-cafe24 text-[0.625rem] leading-[1.5] font-bold whitespace-nowrap tab:text-base',
        )}
      >
        {label}
      </span>
    </span>
  )
}

export { PixelTab, type PixelTabStatus }
