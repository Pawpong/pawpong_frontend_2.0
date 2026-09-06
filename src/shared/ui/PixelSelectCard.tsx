'use client'

import Image from 'next/image'
import { tv } from 'tailwind-variants'
import { PawPrintIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

/**
 * btn-pixel-2 프레임 (Figma 940-27191).
 * 상태별 에셋이 따로 있었지만 path 좌표가 같고 색만 달라 인라인 path 하나로 합쳤다.
 * 테두리는 매 상태 글자와 같은 색이라 currentColor 로 따라간다.
 */
const PIXEL_BORDER =
  'M240.482 20.04H250.503V213.59H20.04V201.938H10.0205V189.539H0V20.04H10.0205V10.0205H240.482V20.04ZM220.442 10.0195H30.0605V0H220.442V10.0195Z'
const PIXEL_FILL =
  'M220.442 20.04H240.482V189.539H220.442V201.938H30.0605V189.539H10.0205V20.04H30.0605V10.0205H220.442V20.04Z'

// 카드 크기: mo·tab 187.65×160 / pc 250.503×213.591. 텍스트는 32px / 40px.
const pixelSelectCard = tv({
  slots: {
    root: 'group relative flex h-[10rem] w-[11.728rem] shrink-0 items-center justify-center transition-colors pc:h-[13.3494rem] pc:w-[15.6564rem]',
    fill: '',
    paw: 'pointer-events-none absolute top-[57.52%] left-[76.44%] aspect-square w-[19.43%] -translate-x-1/2 -translate-y-1/2 rotate-30 items-center justify-center text-secondary-500',
  },
  variants: {
    selected: {
      true: {
        root: 'text-primary-500',
        fill: 'fill-point-500',
        paw: 'flex',
      },
      false: {
        root: 'text-primary-500 hover:text-primary-700',
        fill: 'fill-point-100 group-hover:fill-point-300',
        paw: 'hidden group-hover:flex',
      },
    },
  },
  defaultVariants: { selected: false },
})

interface PixelIllustration {
  /** Figma 원본: 상태가 바뀌어도 일러스트 색상은 유지한다. */
  src: string
  /** 원본 비율 */
  width: number
  height: number
}

interface PixelSelectCardProps {
  label: string
  selected?: boolean
  onClick: () => void
  /** 라벨 위 픽셀 일러스트 (mo·tab 49.75px / pc 80px) */
  illustration?: PixelIllustration
}

const PixelSelectCard = ({ label, selected, onClick, illustration }: PixelSelectCardProps) => {
  const styles = pixelSelectCard({ selected })

  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={styles.root()}>
      <svg
        viewBox="0 0 250.503 213.59"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 size-full"
      >
        <path d={PIXEL_BORDER} fill="currentColor" />
        <path d={PIXEL_FILL} className={styles.fill()} />
      </svg>

      <span className="relative flex flex-col items-center gap-0.5">
        {illustration && (
          <span className="relative block size-[3.109375rem] pc:size-20">
            <Image
              src={illustration.src}
              alt=""
              width={illustration.width}
              height={illustration.height}
              className="size-full object-contain"
            />
          </span>
        )}

        <span
          className={cn(
            cafe24Proup.className,
            'relative font-cafe24 text-[2rem] leading-[1.5] font-bold pc:text-[2.5rem]',
          )}
        >
          {label}
        </span>
      </span>

      {/* 발바닥은 hover(971-15784)·선택(3410-743622) 두 상태에 노출.
          테두리·글자와 달리 두 상태 모두 secondary-500 이라 색을 따로 준다.
          라벨이 아니라 카드 기준 고정 좌표 — 일러스트 유무로 라벨 높이가 달라져도
          같은 자리에 온다.
          icon/paw 박스 48.668 정사각 = 카드의 19.43%, 그 안에서 글리프 33.486 = 68.8%.
          박스 중심은 시안 컨테이너(158.25,89.61 / 66.481)의 중심
          (191.49, 122.85) = (76.44%, 57.52%) — 렌더 실측(191.5,123.0)과 일치 */}
      <span aria-hidden="true" className={styles.paw()}>
        <PawPrintIcon className="h-auto w-[68.8%]" />
      </span>
    </button>
  )
}

export { PixelSelectCard, type PixelIllustration }
