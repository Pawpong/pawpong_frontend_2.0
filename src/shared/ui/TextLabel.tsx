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
  /** 필수/선택 칩을 라벨 오른쪽에 표시 (Figma label-필수). 칩은 항상 14·medium·secondary */
  requirement?: '필수' | '선택'
  /** 렌더 태그 (기본 span). 불릿 리스트 등은 as="ul" */
  as?: React.ElementType
  className?: string
}

const TextLabel = ({
  size,
  weight,
  color,
  requirement,
  as: Tag = 'span',
  className,
  children,
}: TextLabelProps) => (
  <Tag className={cn(textLabelVariants({ size, weight, color }), className)}>
    {children}
    {/* Figma label-필수: 칩(14·medium·secondary)을 인라인으로 — 라벨이 줄바꿈돼도 텍스트 뒤에 흐름 */}
    {requirement && (
      <span
        className={cn(textLabelVariants({ size: '14', weight: 'medium', color: 'secondary' }), 'ms-1')}
      >
        {requirement}
      </span>
    )}
  </Tag>
)

export { TextLabel, textLabelVariants }
