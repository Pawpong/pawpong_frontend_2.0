'use client'

import Image from 'next/image'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'

// btn-pixel-2 상태별 프레임 (Figma 940-27192)
// default: 회색 테두리+흰 배경 / hover: 브라운 테두리+흰 배경 / active(선택): 브라운 테두리+노랑 배경
const FRAME_DEFAULT = '/images/onboarding/btn-pixel-card-default.svg'
const FRAME_HOVER = '/images/onboarding/btn-pixel-card-hover.svg'
const FRAME_ACTIVE = '/images/onboarding/btn-pixel-card-active.svg'

interface UserTypeCardProps {
  label: string
  selected?: boolean
  onClick: () => void
}

// 카드 크기: mo = medium(187.65x160), tab+ = large(250.5x213.6) / 텍스트: mo 32px, tab+ 40px
const UserTypeCard = ({ label, selected, onClick }: UserTypeCardProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className="group relative flex h-[10rem] w-[11.728rem] items-center justify-center tab:h-[13.375rem] tab:w-[15.656rem]"
  >
    {selected ? (
      <Image
        src={FRAME_ACTIVE}
        alt=""
        fill
        sizes="(max-width: 768px) 188px, 250px"
        className="object-contain"
        priority
      />
    ) : (
      <>
        <Image
          src={FRAME_DEFAULT}
          alt=""
          fill
          sizes="(max-width: 768px) 188px, 250px"
          className="object-contain group-hover:hidden"
          priority
        />
        {/* priority: hidden 상태로 lazy 로드되면 첫 hover 시 프레임 깜빡임 */}
        <Image
          src={FRAME_HOVER}
          alt=""
          fill
          sizes="(max-width: 768px) 188px, 250px"
          className="hidden object-contain group-hover:block"
          priority
        />
      </>
    )}
    <span
      className={cn(
        cafe24Proup.className,
        'relative z-10 font-cafe24 text-[2rem] leading-[1.5] font-bold tab:text-[2.5rem]',
        selected ? 'text-[#a9835a]' : 'text-neutral-700 group-hover:text-[#a9835a]',
      )}
    >
      {label}
    </span>
  </button>
)

export { UserTypeCard }
