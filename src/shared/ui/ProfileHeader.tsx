'use client'

import Link from 'next/link'
import { ProfileAvatar } from './ProfileAvatar'
import { MoreVertIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// Figma chat-profile (1867-182359) — 아바타 + 이름·시각 + 미리보기 1줄 + (옵션)빨간 배지 + 더보기
// 채팅 리스트·저장피드 카드 헤더 공용. type: sm(아바타 32·이름 14) / md(아바타 40·이름 16).
const NAME_SIZE = { sm: 'text-sm', md: 'text-base' } as const
const AVATAR_SIZE = { sm: 'small', md: 'medium' } as const

interface ProfileHeaderProps {
  nickname: string
  createdAt: string
  /** 미리보기 본문 (1줄 말줄임) */
  preview: string
  profileImageUrl?: string
  type?: 'sm' | 'md'
  /** 빨간 알림 배지 카운트 (채팅용) — 없으면 미노출 */
  badgeCount?: number
  /** 프로필·본문 클릭 시 이동 링크 */
  detailHref?: string
  onMore?: () => void
  className?: string
}

const ProfileHeader = ({
  nickname,
  createdAt,
  preview,
  profileImageUrl,
  type = 'md',
  badgeCount,
  detailHref,
  onMore,
  className,
}: ProfileHeaderProps) => {
  const profile = (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <ProfileAvatar
        size={AVATAR_SIZE[type]}
        src={profileImageUrl}
        alt={nickname}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2 p-0.5">
          <span className={cn('truncate font-semibold text-[#3e3e3e]', NAME_SIZE[type])}>
            {nickname}
          </span>
          <span className="shrink-0 text-xs leading-[1.5] font-medium text-[#6b6b6b]">
            {createdAt}
          </span>
        </div>
        <p className="truncate text-sm leading-[1.5] font-semibold text-[#3e3e3e]">{preview}</p>
      </div>
    </div>
  )

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {detailHref ? (
          <Link href={detailHref} className="flex min-w-0 flex-1">
            {profile}
          </Link>
        ) : (
          profile
        )}
        {badgeCount !== undefined && (
          <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-[#d63d4a] px-2 text-sm leading-[1.5] text-white">
            {badgeCount}
          </span>
        )}
      </div>
      <button type="button" aria-label="더보기" onClick={onMore} className="shrink-0">
        <MoreVertIcon className="size-6 text-[#3e3e3e]" />
      </button>
    </div>
  )
}

export { ProfileHeader }
