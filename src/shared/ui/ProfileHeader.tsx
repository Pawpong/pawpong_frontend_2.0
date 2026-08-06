'use client'

import Link from 'next/link'
import { ProfileAvatar } from './ProfileAvatar'
import { MoreVertIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// Figma chat-profile (1867-182359) — 아바타 + 이름·시각 + 미리보기 1줄 + (옵션)빨간 배지 + 더보기
// 채팅 리스트·저장피드 카드 헤더 공용.
// type: sm(아바타 32·이름 14) / md(아바타 40·이름 16) / responsivePc(32·14 → pc 40·16, 홈 쇼케이스)
const NAME_SIZE = { sm: 'text-sm', md: 'text-base', responsivePc: 'text-sm pc:text-base' } as const
const AVATAR_SIZE = { sm: 'small', md: 'medium', responsivePc: 'responsivePc' } as const

interface ProfileHeaderProps {
  nickname: string
  createdAt: string
  /** 미리보기 본문 (1줄 말줄임) */
  preview: string
  profileImageUrl?: string
  type?: 'sm' | 'md' | 'responsivePc'
  /** 빨간 알림 배지 카운트 (채팅용) — 없으면 미노출 */
  badgeCount?: number
  /** 프로필·본문 클릭 시 이동 링크 */
  detailHref?: string
  /** 미리보기 끝에 [더보기] 라벨 노출 (홈 쇼케이스 모바일·태블릿) */
  showMore?: boolean
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
  showMore,
  onMore,
  className,
}: ProfileHeaderProps) => {
  // 홈 쇼케이스(community home-contents) 전용 스펙: 이름 14 / 시각 10 / 미리보기 12 / 가로 더보기(⋯)
  const isShowcase = type === 'responsivePc'
  const previewSize = isShowcase ? 'text-xs' : 'text-sm'
  const timeSize = isShowcase ? 'text-[0.625rem]' : 'text-xs'
  const profile = (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <ProfileAvatar
        size={AVATAR_SIZE[type]}
        src={profileImageUrl}
        alt={nickname}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-0.5 p-0.5 tab:gap-1 pc:gap-2">
          <span className={cn('truncate font-semibold text-neutral-850', NAME_SIZE[type])}>
            {nickname}
          </span>
          <span className={cn('shrink-0 leading-[1.5] font-medium text-neutral-700', timeSize)}>
            {createdAt}
          </span>
        </div>
        {showMore ? (
          <div className="flex items-center gap-0.5">
            <p
              className={cn(
                'min-w-0 flex-1 truncate leading-[1.5] font-semibold text-neutral-850',
                previewSize,
              )}
            >
              {preview}
            </p>
            <span
              className={cn('shrink-0 leading-[1.5] font-medium text-neutral-700', previewSize)}
            >
              [더보기]
            </span>
          </div>
        ) : (
          <p className={cn('truncate leading-[1.5] font-semibold text-neutral-850', previewSize)}>
            {preview}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {detailHref ? (
          <Link href={detailHref} className="flex min-w-0 flex-1">
            {profile}
          </Link>
        ) : (
          profile
        )}
        {badgeCount !== undefined && (
          <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-error-500 px-2 text-sm leading-[1.5] text-white">
            {badgeCount}
          </span>
        )}
      </div>
      <button type="button" aria-label="더보기" onClick={onMore} className="shrink-0">
        {/* 쇼케이스는 가로 더보기(⋯) — 세로 아이콘 90도 회전 재사용 */}
        <MoreVertIcon className={cn('size-6 text-neutral-850', isShowcase && 'rotate-90')} />
      </button>
    </div>
  )
}

export { ProfileHeader }
