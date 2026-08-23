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

// 카드 크기: mo = medium(187.65x160), tab+ = large(250.503x213.591) / 텍스트: mo 32px, tab+ 40px
const pixelSelectCard = tv({
  slots: {
    root: 'group relative flex h-[10rem] w-[11.728rem] items-center justify-center transition-colors tab:h-[13.3494rem] tab:w-[15.6564rem]',
    fill: '',
    // 활성(컬러) 일러스트는 기본(회색) 위에 겹쳐 두고 노출만 토글한다
    activeArt: 'absolute top-0 left-0 h-full w-auto',
    paw: 'pointer-events-none absolute top-[57.52%] left-[76.44%] aspect-square w-[19.43%] -translate-x-1/2 -translate-y-1/2 rotate-30 items-center justify-center text-secondary-500',
  },
  variants: {
    selected: {
      true: {
        root: 'text-primary-500',
        fill: 'fill-point-500',
        activeArt: 'block',
        paw: 'flex',
      },
      false: {
        root: 'text-neutral-500 hover:text-secondary-500',
        fill: 'fill-neutral-50 group-hover:fill-point-100',
        activeArt: 'hidden group-hover:block',
        paw: 'hidden group-hover:flex',
      },
    },
  },
  defaultVariants: { selected: false },
})

interface PixelIllustration {
  /** 기본(회색) / 활성(컬러) 두 벌 — 디자인상 색만 다른 별개 에셋이라 필터로 대체 불가 */
  defaultSrc: string
  activeSrc: string
  /** 원본 픽셀 크기. 종마다 가로가 달라(강아지 94, 나머지 88) 비율 보존에 필요 */
  width: number
  height: number
}

interface PixelSelectCardProps {
  label: string
  selected?: boolean
  onClick: () => void
  /** 라벨 위 픽셀 일러스트 (Figma animal md — 높이 99.643) */
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
          // 높이만 고정하고 가로는 원본 비율에 맡긴다
          <span className="relative block h-[4.6656rem] tab:h-[6.2277rem]">
            <Image
              src={illustration.defaultSrc}
              alt=""
              width={illustration.width}
              height={illustration.height}
              className="h-full w-auto"
            />
            {/* priority: 지연 로드되면 첫 hover 때 컬러 전환이 한 박자 늦는다 */}
            <Image
              src={illustration.activeSrc}
              alt=""
              width={illustration.width}
              height={illustration.height}
              priority
              className={styles.activeArt()}
            />
          </span>
        )}

        <span
          className={cn(
            cafe24Proup.className,
            'relative font-cafe24 text-[2rem] leading-[1.5] font-bold tab:text-[2.5rem]',
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
