import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'

/**
 * 카드 첫 줄 — 누구(이름)와 무엇(상담한 아이 등)을 왼쪽에, 상태를 오른쪽 끝에 둔다.
 * 목록을 훑을 때 상태가 같은 세로줄에 맞춰 읽힌다.
 */
export const ActivityIdentity = ({
  name,
  image,
  subtitle,
  meta,
  badge,
}: {
  name: string
  image?: string | null
  subtitle?: ReactNode
  meta?: string
  badge: ReactNode
}) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar size="md" className="size-11 shrink-0 bg-primary-50 tab:size-12">
      {image && <AvatarImage src={image} alt={`${name} 프로필`} boxWidth={48} />}
      <AvatarFallback />
    </Avatar>
    <div className="min-w-0 flex-1">
      <p className={`${TEXT.body} truncate`}>{name}</p>
      {subtitle && (
        <div className={`${TEXT.sub} mt-0.5 flex min-w-0 items-center gap-1.5`}>{subtitle}</div>
      )}
      {meta && <p className={`${TEXT.meta} mt-0.5`}>{meta}</p>}
    </div>
    {badge && <div className="shrink-0 self-start">{badge}</div>}
  </div>
)
