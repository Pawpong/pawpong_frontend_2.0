import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

interface GenderIconProps {
  gender: 'male' | 'female'
  className?: string
}

const GENDER_ICON_SRC = {
  female: '/images/icons/gender-female.svg',
  male: '/images/icons/gender-male.svg',
} as const

const GenderIcon = ({ gender, className }: GenderIconProps) => {
  return (
    <span className={cn('relative inline-flex size-6 shrink-0', className)} aria-hidden="true">
      <Image
        src={GENDER_ICON_SRC[gender]}
        alt=""
        width={32}
        height={32}
        className="size-full object-contain"
      />
    </span>
  )
}

export { GenderIcon }
