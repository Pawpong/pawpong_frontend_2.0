import Image from 'next/image'
import Link from 'next/link'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

// 픽셀 발자국 (Figma 2752-266393) — 회전 전 48px wrapper 좌표
const CTA_PAWS = [
  'left-[75.31%] top-[5.86%]',
  'left-[83.03%] top-[40.17%]',
  'left-[93.87%] top-[-5.32%]',
  'left-[87.75%] top-[-55.9%]',
]

const CtaArrowIcon = () => (
  <span className="flex h-4 shrink-0 items-center justify-center" aria-hidden>
    <svg
      viewBox="0 0 10.8333 16.6667"
      className="h-[0.8125rem] w-[0.5279rem] text-primary-600"
      fill="none"
    >
      <path d="M4.33333 0H0V4.16667H4.33333V0Z" fill="currentColor" />
      <path d="M7.58333 3.125H3.25V7.29167H7.58333V3.125Z" fill="currentColor" />
      <path d="M10.8333 6.25H6.5V10.4167H10.8333V6.25Z" fill="currentColor" />
      <path d="M7.58333 9.375H3.25V13.5417H7.58333V9.375Z" fill="currentColor" />
      <path d="M4.33333 12.5H0V16.6667H4.33333V12.5Z" fill="currentColor" />
    </svg>
  </span>
)

interface CtaBannerProps {
  text: string
  /** 지정하면 배너 전체가 링크가 된다 (홈 CTA 스트립은 이동이 없어 미지정) */
  href?: string
}

/**
 * 픽셀 발자국 CTA 스트립 (Figma 2752-266432 / 2752-266394).
 * 스트립 px-16 py-12(pc px-32) · 텍스트 12px -> pc 14px · PC 폭 1134.
 */
const CtaBanner = ({ text, href }: CtaBannerProps) => {
  const barClass =
    'relative mx-auto flex w-full items-center justify-between overflow-hidden rounded-xl bg-secondary-200 px-4 py-3 pc:max-w-[70.875rem] pc:px-8'

  const content = (
    <>
      {/* 배경 픽셀 발자국 — 텍스트 뒤(z-0) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {CTA_PAWS.map((pos) => (
          <span
            key={pos}
            className={cn('absolute flex size-[3.02rem] items-center justify-center', pos)}
          >
            <Image
              src="/images/category/cta-paw.svg"
              alt=""
              width={37}
              height={32}
              className="h-[1.9765rem] w-[2.2896rem] rotate-45"
            />
          </span>
        ))}
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

  return href ? (
    <Link href={href} className={barClass}>
      {content}
    </Link>
  ) : (
    <div className={barClass}>{content}</div>
  )
}

export { CtaBanner }
