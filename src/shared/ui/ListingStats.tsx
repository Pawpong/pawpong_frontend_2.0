import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const listingStatsVariants = tv({
  base: 'flex items-center font-medium text-[#8e8e8e]',
  variants: {
    size: {
      sm: 'gap-[0.375rem] text-[0.625rem] leading-[1.286rem]',
      md: 'gap-[0.5rem] text-[0.75rem] leading-normal',
      lg: 'gap-[1.25rem] text-[0.875rem] leading-[1.375rem]',
    },
  },
  defaultVariants: { size: 'md' },
})

interface ListingStatsProps extends VariantProps<typeof listingStatsVariants> {
  inquiryCount: number
  favoriteCount: number
  viewCount: number
  className?: string
}

const ListingStats = ({
  inquiryCount,
  favoriteCount,
  viewCount,
  size,
  className,
}: ListingStatsProps) => (
  <div className={cn(listingStatsVariants({ size }), className)}>
    <span>문의 {inquiryCount}</span>
    <span>관심 {favoriteCount}</span>
    <span>조회 {viewCount}</span>
  </div>
)

export { ListingStats, listingStatsVariants }
