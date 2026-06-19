import { cn } from '@/shared/lib/cn'
import { PixelUserIcon } from '@/shared/assets/icons'

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'responsive'
  className?: string
}

const AVATAR_SIZE = {
  sm: { box: 'size-8', glyph: 'size-4' },
  md: { box: 'size-10', glyph: 'h-[1.375rem] w-[1.3125rem]' },
  // 모바일/태블릿 32px → PC 40px (펫 카드 반응형과 동일 기준)
  responsive: { box: 'size-8 pc:size-10', glyph: 'size-4 pc:h-[1.375rem] pc:w-[1.3125rem]' },
} as const

/** 채팅 프로필 placeholder 아바타 (피그마 icon/interactive/tertiary + 픽셀 유저 글리프) */
const ProfileAvatar = ({ size = 'sm', className }: ProfileAvatarProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a6a6a6] text-[#f6f6f6]',
        AVATAR_SIZE[size].box,
        className,
      )}
    >
      <PixelUserIcon className={AVATAR_SIZE[size].glyph} />
    </div>
  )
}

export { ProfileAvatar }
