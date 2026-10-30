import Link from 'next/link'
import { tv, type VariantProps } from '@/shared/lib/tv'
import { ArrowRightIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

const detailLinkVariants = tv({
  base: 'focus-ring touch-target relative flex shrink-0 items-center text-text-primary whitespace-nowrap',
  variants: {
    variant: {
      // Figma txt btn: 좌우 padding 4px, gap 0
      link: 'px-[0.25rem] font-semibold',
      button: 'gap-[0.375rem] font-medium',
    },
    size: {
      sm: 'text-[0.75rem] leading-[1.5]',
      md: 'text-[0.875rem] leading-[1.5]',
      lg: 'text-[1rem] leading-[1.5]',
      /** 섹션 머리 더보기 — 12 → 14 */
      responsive: 'text-[0.75rem] leading-[1.5] tab:text-[0.875rem]',
    },
  },
  defaultVariants: {
    variant: 'link',
    size: 'md',
  },
})

type DetailLinkVariants = VariantProps<typeof detailLinkVariants>

const SMALL_SIZES = new Set<DetailLinkVariants['size']>(['sm', 'responsive'])

interface DetailLinkAsLink extends DetailLinkVariants {
  variant?: 'link'
  href: string
  onClick?: never
  label?: string
  className?: string
}

interface DetailLinkAsButton extends DetailLinkVariants {
  variant: 'button'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  href?: never
  label?: string
  className?: string
}

type DetailLinkProps = DetailLinkAsLink | DetailLinkAsButton

const DetailLink = ({
  variant = 'link',
  size,
  href,
  onClick,
  label = '자세히 보기',
  className,
}: DetailLinkProps) => {
  const classes = cn(detailLinkVariants({ variant, size }), className)

  const content = (
    <>
      {label}
      {/* 작은 글자 옆에서는 화살표도 줄인다 — 20px 고정이면 글자보다 화살표가 앞선다 */}
      <ArrowRightIcon
        className={cn('shrink-0', SMALL_SIZES.has(size) ? 'size-4' : 'size-[1.25rem]')}
      />
    </>
  )

  if (variant === 'button') {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    )
  }

  return (
    <Link href={href!} className={classes}>
      {content}
    </Link>
  )
}

export { DetailLink, detailLinkVariants }
