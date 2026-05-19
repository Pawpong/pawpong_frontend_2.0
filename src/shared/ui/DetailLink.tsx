import Link from 'next/link'
import { tv, type VariantProps } from 'tailwind-variants'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'

const detailLinkVariants = tv({
  base: 'flex shrink-0 items-center text-text-primary whitespace-nowrap',
  variants: {
    variant: {
      link: 'font-semibold',
      button: 'gap-[0.375rem] font-medium',
    },
    size: {
      sm: 'text-[0.75rem]',
      md: 'text-[0.875rem] leading-[1.375rem]',
      lg: 'text-[1rem] leading-[1.375rem]',
    },
  },
  defaultVariants: {
    variant: 'link',
    size: 'md',
  },
})

type DetailLinkVariants = VariantProps<typeof detailLinkVariants>

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

  if (variant === 'button') {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {label}
        <ArrowRightIcon className="size-[1.25rem] shrink-0" />
      </button>
    )
  }

  return (
    <Link href={href!} className={classes}>
      {`${label} >`}
    </Link>
  )
}

export { DetailLink, detailLinkVariants }
