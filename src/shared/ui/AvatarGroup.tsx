'use client'

import { cn } from '@/shared/lib/Cn'
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'
import type { VariantProps } from 'tailwind-variants'

type AvatarSize = 'xs' | 'sm'

interface AvatarItem {
  id: string | number
  imageUrl: string | null
}

interface AvatarGroupProps {
  avatars: AvatarItem[]
  size?: AvatarSize
  overlapClassName?: string
  ringClassName?: string
  fallbackClassName?: string
  className?: string
}

const AvatarGroup = ({
  avatars,
  size = 'xs',
  overlapClassName = '-ml-[0.55rem]',
  ringClassName = 'ring-[3px] ring-white',
  fallbackClassName = 'bg-surface-placeholder',
  className,
}: AvatarGroupProps) => (
  <div className={cn('flex items-center', className)}>
    {avatars.map((avatar, i) => (
      <div key={avatar.id} className={i > 0 ? overlapClassName : ''}>
        <Avatar size={size} className={ringClassName}>
          {avatar.imageUrl ? (
            <AvatarImage src={avatar.imageUrl} alt="avatar" />
          ) : (
            <AvatarFallback className={fallbackClassName} />
          )}
        </Avatar>
      </div>
    ))}
  </div>
)

export { AvatarGroup }
export type { AvatarGroupProps, AvatarItem }
