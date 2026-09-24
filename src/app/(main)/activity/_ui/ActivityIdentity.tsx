import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'

export const ActivityIdentity = ({
  name,
  image,
  meta,
  badge,
}: {
  name: string
  image?: string | null
  meta: string
  badge: ReactNode
}) => (
  <div className="flex min-w-0 items-start gap-3">
    <Avatar size="md" className="size-11 shrink-0 bg-primary-50 tab:size-12">
      {image && <AvatarImage src={image} alt={`${name} 프로필`} />}
      <AvatarFallback />
    </Avatar>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`${TEXT.body} [overflow-wrap:anywhere] break-words`}>{name}</span>
        {badge}
      </div>
      <p className={`${TEXT.meta} mt-1`}>{meta}</p>
    </div>
  </div>
)
