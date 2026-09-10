import { tv, type VariantProps } from 'tailwind-variants'
import { LocationOnIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

const locationText = tv({
  slots: {
    root: 'flex min-w-0 items-center gap-0.5 text-primary-500',
    icon: 'size-4 shrink-0',
    label: 'truncate leading-[1.5] font-medium',
  },
  variants: {
    size: {
      md: { label: 'text-sm' },
      // 좁은 카드(모바일 2열 164px)에서는 이름 크기와 겹치지 않게 10 으로 내린다
      compact: { label: 'text-[0.625rem] tab:text-sm' },
    },
  },
  defaultVariants: { size: 'md' },
})

interface LocationTextProps extends VariantProps<typeof locationText> {
  /** 표시용으로 이미 정리된 소재지 문자열 (formatBreederLocation 계열을 거친 값) */
  location: string
  className?: string
}

/** 브리더 소재지 한 줄 — 아이콘 + 지역명. 색·아이콘은 고정, 글자 크기만 자리에 맞춘다. */
const LocationText = ({ location, size, className }: LocationTextProps) => {
  const { root, icon, label } = locationText({ size })

  return (
    <span className={cn(root(), className)}>
      <LocationOnIcon className={icon()} />
      <span className={label()}>{location}</span>
    </span>
  )
}

export { LocationText }
