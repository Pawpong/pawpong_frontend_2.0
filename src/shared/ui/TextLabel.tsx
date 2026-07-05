import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'

// Figma 926-25253 Label — 텍스트 라벨 (패딩 spacing/2 2px)
const textLabelVariants = tv({
  base: 'p-0.5 leading-[1.5]',
  variants: {
    size: {
      '14': 'text-sm',
      '16': 'text-base',
      '20': 'text-xl',
    },
    weight: {
      bold: 'font-semibold',
      medium: 'font-medium',
    },
    // text-interactive-primary #3E3E3E / secondary #6B6B6B
    color: {
      primary: 'text-[#3e3e3e]',
      secondary: 'text-[#6b6b6b]',
    },
  },
  defaultVariants: { size: '16', weight: 'bold', color: 'primary' },
})

interface TextLabelProps extends VariantProps<typeof textLabelVariants> {
  children: React.ReactNode
  className?: string
}

const TextLabel = ({ size, weight, color, className, children }: TextLabelProps) => {
  return (
    <span className={cn(textLabelVariants({ size, weight, color }), className)}>{children}</span>
  )
}

export { TextLabel, textLabelVariants }
