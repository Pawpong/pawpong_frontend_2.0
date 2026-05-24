import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const postedDateVariants = tv({
  base: 'flex items-center gap-[0.438rem] text-[#a3a3a3]',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs tab:text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: { size: 'sm' },
})

interface PostedDateProps extends VariantProps<typeof postedDateVariants> {
  date: string
  className?: string
}

const PostedDate = ({ date, size, className }: PostedDateProps) => (
  <div className={cn(postedDateVariants({ size }), className)}>
    <span>게시날짜</span>
    <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
    <span>{date}</span>
  </div>
)

export { PostedDate, postedDateVariants }
