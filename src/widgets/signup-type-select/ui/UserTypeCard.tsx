'use client'

import Image from 'next/image'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'

interface UserTypeCardProps {
  label: string
  imageSrc: string
  textColor: string
  selected?: boolean
  onClick: () => void
}

const UserTypeCard = ({ label, imageSrc, textColor, selected, onClick }: UserTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[10rem] w-[12rem] items-center justify-center transition-transform hover:scale-105 tab:h-[13.375rem] tab:w-[15.656rem] ${selected ? 'scale-105' : ''}`}
    >
      <Image src={imageSrc} alt="" fill className="object-contain" priority />
      <span
        className={cn(
          cafe24Proup.className,
          `relative z-10 font-cafe24 text-[1.5rem] font-bold leading-[1.5] tab:text-[2.5rem]`,
          textColor,
        )}
      >
        {label}
      </span>
    </button>
  )
}

export { UserTypeCard }
