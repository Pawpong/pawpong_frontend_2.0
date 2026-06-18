import { cn } from '@/shared/lib/cn'
import { PixelUserIcon } from '@/shared/assets/icons'

interface ProfileAvatarProps {
  size?: 'sm' | 'md'
  className?: string
}

/** 채팅 프로필 placeholder 아바타 (피그마 icon/interactive/tertiary + 픽셀 유저 글리프) */
const ProfileAvatar = ({ size = 'sm', className }: ProfileAvatarProps) => {
  const isMd = size === 'md'

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#a6a6a6] text-[#f6f6f6]',
        isMd ? 'size-10' : 'size-8',
        className,
      )}
    >
      <PixelUserIcon className={isMd ? 'h-[1.375rem] w-[1.3125rem]' : 'size-4'} />
    </div>
  )
}

export { ProfileAvatar }
