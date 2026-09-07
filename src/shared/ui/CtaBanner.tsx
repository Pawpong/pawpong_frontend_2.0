import Image from 'next/image'
import Link from 'next/link'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

// PC 픽셀 발자국 (Figma 2752-266393) — 회전 전 48px wrapper 좌표
const CTA_PAWS_PC = [
  'left-[75.31%] top-[5.86%]',
  'left-[83.03%] top-[40.17%]',
  'left-[93.87%] top-[-5.32%]',
  'left-[87.75%] top-[-55.9%]',
]

// 모바일·탭 픽셀 발자국 (Figma 2937-336955) — 우측 패턴 영역 기준 좌표
const CTA_PAWS_COMPACT = [
  'left-[27.1%] top-[46.03%]',
  'left-[54.19%] top-[-1.83%]',
  'left-[81.29%] top-[28.24%]',
]

const CtaArrowIcon = () => (
  <span
    className="flex size-[1.17rem] shrink-0 items-center justify-center pc:size-[1.3rem]"
    aria-hidden
  >
    <Image
      src="/images/category/cta-arrow-compact.svg"
      alt=""
      width={9.75}
      height={15}
      className="h-[0.9375rem] w-[0.6094rem] pc:hidden"
    />
    <Image
      src="/images/category/cta-arrow.svg"
      alt=""
      width={10.8333}
      height={16.6667}
      className="hidden h-[1.0417rem] w-[0.6771rem] pc:block"
    />
  </span>
)

const CtaPaw = ({
  src,
  position,
  compact = false,
}: {
  src: string
  position: string
  compact?: boolean
}) => (
  <span className={cn('absolute flex size-[3.02rem] items-center justify-center', position)}>
    <Image
      src={src}
      alt=""
      width={compact ? 22.0302 : 36.6343}
      height={compact ? 19.0167 : 31.6232}
      className={cn(
        'rotate-45',
        compact ? 'h-[1.1885rem] w-[1.3769rem]' : 'h-[1.9765rem] w-[2.2896rem]',
      )}
    />
  </span>
)

interface CtaBannerProps {
  text: string
  /** 지정하면 배너 전체가 링크가 된다 (홈 CTA 스트립은 이동이 없어 미지정) */
  href?: string
  /** 지정하면 배너 전체가 버튼이 된다 (href 와 동시에 쓰지 않는다) */
  onClick?: () => void
  /**
   * secondary(기본, 홈 브리더 CTA) / point(문의하기 안내 배너, Figma 2752-266394 기본 override).
   * 같은 컴포넌트를 가리키는 다른 색 override라 tone 으로 분기한다.
   */
  tone?: 'secondary' | 'point'
}

const TONE_CLASS = {
  secondary: 'border border-secondary-400 bg-secondary-50',
  point: 'border border-secondary-400 bg-secondary-50',
} as const

/**
 * 픽셀 발자국 CTA 스트립 (Figma 2937-336918 / 2752-266432 / 2752-266394).
 * 스트립 px-16 py-12(pc px-32) · 텍스트 12px -> pc 14px · PC 폭 1134.
 */
const CtaBanner = ({ text, href, onClick, tone = 'secondary' }: CtaBannerProps) => {
  const barClass = cn(
    'relative mx-auto flex h-[2.3125rem] w-full max-w-[70.875rem] items-center justify-between overflow-hidden rounded-xl px-4 pc:h-[2.8125rem] pc:px-8',
    TONE_CLASS[tone],
  )
  // point 톤의 발자국 색(secondary-500)이 기본 톤과 같아져 동일 에셋을 재사용한다.
  const pawSrc = {
    compact: '/images/category/cta-paw.svg',
    desktop: '/images/category/cta-paw.svg',
  }

  const content = (
    <>
      {/* 배경 픽셀 발자국 — 텍스트 뒤(z-0) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-y-[-0.65625rem] right-[1.18125rem] w-[9.693625rem] pc:hidden">
          {CTA_PAWS_COMPACT.map((position) => (
            <CtaPaw key={position} src={pawSrc.compact} position={position} compact />
          ))}
        </div>
        <div className="absolute inset-0 hidden pc:block">
          {CTA_PAWS_PC.map((position) => (
            <CtaPaw key={position} src={pawSrc.desktop} position={position} />
          ))}
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-[0.4375rem]">
        <p
          className={cn(cafe24Proup.className, 'text-xs leading-[1.5] text-primary-600 pc:text-sm')}
        >
          {text}
        </p>
        <CtaArrowIcon />
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={barClass}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={barClass}>
        {content}
      </button>
    )
  }

  return <div className={barClass}>{content}</div>
}

export { CtaBanner }
