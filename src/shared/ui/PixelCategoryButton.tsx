'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'

// 픽셀 카테고리 버튼 — 활성 노랑+갈색 텍스트, hover 골드 보더+갈색 텍스트, 비활성 흰색+회색 텍스트
const ASSETS = {
  active: '/images/category/btn-pixel-category-active.svg',
  hover: '/images/category/btn-pixel-category-hover.svg',
}

// [refactored] 카테고리 버튼 그리드 래퍼 (모바일 2열 / 데스크탑 4열)
export const PIXEL_CATEGORY_GRID =
  'mx-auto grid w-fit grid-cols-2 gap-x-[1.25rem] gap-y-[0.5rem] tab:grid-cols-4 tab:gap-y-0 pc:gap-x-[2rem]'

const BUTTON_CLASS =
  'group relative flex h-[2.125rem] w-[6.640625rem] items-center justify-center gap-[0.125rem] p-[0.5rem] pc:h-[3.8371rem] pc:w-[11.990875rem]'

interface PixelCategoryButtonProps {
  label: string
  /** 비활성 기본 SVG (explore: inactive / 홈: 기본 버튼) */
  defaultSrc: string
  /** 활성(노랑) 여부 — CategoryFilter 전용 */
  active?: boolean
  /** Link로 렌더(홈) — onClick 대신 사용 */
  href?: string
  /** button으로 렌더(explore) 클릭 핸들러 */
  onClick?: () => void
  /** 라벨 우측 아이콘 등 */
  children?: React.ReactNode
}

const PixelCategoryButton = ({
  label,
  defaultSrc,
  active,
  href,
  onClick,
  children,
}: PixelCategoryButtonProps) => {
  const content = (
    <>
      {active ? (
        <Image
          src={ASSETS.active}
          alt=""
          fill
          sizes="(max-width: 1440px) 106px, 192px"
          className="object-fill"
        />
      ) : (
        <>
          {/* 기본 / hover 시 골드 보더로 전환 (display 토글) */}
          <Image
            src={defaultSrc}
            alt=""
            fill
            sizes="(max-width: 1440px) 106px, 192px"
            className="object-fill group-hover:hidden"
          />
          <Image
            src={ASSETS.hover}
            alt=""
            fill
            sizes="(max-width: 1440px) 106px, 192px"
            className="hidden object-fill group-hover:block"
          />
        </>
      )}
      <span
        className={cn(
          cafe24Proup.className,
          'relative z-10 font-cafe24 text-[0.625rem] leading-[1.5] font-normal whitespace-nowrap pc:text-[1rem]',
          active ? 'text-[#a9835a]' : 'text-neutral-700 group-hover:text-[#a9835a]',
        )}
      >
        {label}
      </span>
      {children}
    </>
  )

  return href ? (
    <Link href={href} className={BUTTON_CLASS}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={BUTTON_CLASS}>
      {content}
    </button>
  )
}

export { PixelCategoryButton }
