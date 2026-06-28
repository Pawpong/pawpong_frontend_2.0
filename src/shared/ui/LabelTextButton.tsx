import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { DetailLink } from './DetailLink'

// Figma: label txt btn (922-17441) — 라벨 + 우측 텍스트버튼(화살표) 헤더, 사이즈 3종
const labelTextButtonVariants = tv({
  slots: {
    root: 'flex items-center justify-between',
    label: 'font-bold whitespace-nowrap text-text-primary',
  },
  variants: {
    size: {
      medium: { label: 'text-sm leading-[1.5]' },
      large: { label: 'text-base leading-[1.5]' },
      xlarge: { label: 'text-xl leading-[1.5]' },
    },
  },
  defaultVariants: {
    size: 'large',
  },
})

// 라벨 사이즈별 우측 텍스트버튼(DetailLink) 사이즈 매핑 (Figma 토큰 기준)
const ACTION_SIZE = {
  medium: 'sm',
  large: 'md',
  xlarge: 'md',
} as const

type LabelTextButtonVariants = VariantProps<typeof labelTextButtonVariants>

interface LabelTextButtonProps extends LabelTextButtonVariants {
  label: string
  className?: string
  /** 라벨 텍스트 스타일 오버라이드 (반응형 사이즈 등) */
  labelClassName?: string
  /** 우측 텍스트버튼 라벨 — href와 함께 있을 때만 노출 (없으면 라벨 전용) */
  actionLabel?: string
  href?: string
}

const LabelTextButton = ({
  size = 'large',
  label,
  actionLabel,
  href,
  className,
  labelClassName,
}: LabelTextButtonProps) => {
  const { root, label: labelClass } = labelTextButtonVariants({ size })
  const actionSize = ACTION_SIZE[size ?? 'large']

  return (
    <div className={cn(root(), className)}>
      <p className={cn(labelClass(), labelClassName)}>{label}</p>
      {actionLabel && href && (
        <DetailLink href={href} label={actionLabel} size={actionSize} />
      )}
    </div>
  )
}

export { LabelTextButton, labelTextButtonVariants }
