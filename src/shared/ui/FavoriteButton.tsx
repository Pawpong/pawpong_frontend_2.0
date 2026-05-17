import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'
import { FavoriteIcon } from '@/shared/assets/icons'

const favoriteButtonVariants = tv({
  base: 'flex items-center rounded-full font-medium text-[#5d5d5d]',
  variants: {
    size: {
      sm: 'gap-[0.25rem] text-[0.75rem]',
      md: 'gap-[0.585rem] p-[0.585rem] text-[0.819rem]',
      lg: 'gap-[0.625rem] p-[0.625rem] text-[0.875rem]',
    },
  },
  defaultVariants: { size: 'lg' },
})

const favoriteIconSize = {
  sm: 'size-[1.403rem]',
  md: 'size-[1.403rem]',
  lg: 'size-[1.5rem]',
} as const

interface FavoriteButtonProps
  extends VariantProps<typeof favoriteButtonVariants> {
  className?: string
  onClick?: () => void
}

const FavoriteButton = ({
  size = 'lg',
  className,
  onClick,
}: FavoriteButtonProps) => (
  <button
    type="button"
    className={cn(favoriteButtonVariants({ size }), className)}
    onClick={onClick}
  >
    <FavoriteIcon className={favoriteIconSize[size ?? 'lg']} />
    <span>관심있어요</span>
  </button>
)

export { FavoriteButton, favoriteButtonVariants }
