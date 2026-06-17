import { cn } from '@/shared/lib/cn'

interface ProfileAvatarProps {
  size?: 'sm' | 'md'
  className?: string
}

/** 채팅 프로필 placeholder 아바타 (피그마 icon/interactive/tertiary 기준) */
const ProfileAvatar = ({ size = 'sm', className }: ProfileAvatarProps) => {
  return (
    <div
      className={cn(
        'shrink-0 rounded-full bg-[#a6a6a6]',
        size === 'md' ? 'size-10' : 'size-8',
        className,
      )}
    />
  )
}

export { ProfileAvatar }
