import Link from 'next/link'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import { cn } from '@/shared/lib/cn'
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

interface AuthorInfoProps {
  authorId: string
  nickname: string
  profileImageUrl?: string
  createdAt: string
  className?: string
  /** sm: 아바타 37·이름 14 (기본) / md: 아바타 40·이름 16 (커뮤니티 상세·댓글, Figma chat-profile) */
  size?: 'sm' | 'md'
  /** 닉네임 앞 (레벨 그림) */
  nameLeading?: React.ReactNode
  /** 이름 줄 아래 추가 콘텐츠 (댓글 본문 등) */
  contentSlot?: React.ReactNode
}

const AuthorInfo = ({
  authorId,
  nickname,
  profileImageUrl,
  createdAt,
  className,
  size = 'sm',
  contentSlot,
  nameLeading,
}: AuthorInfoProps) => {
  // ISO 시간은 상대 시간("N시간 전")으로 표시. 목업 문자열은 그대로 통과.
  const displayTime = formatRelativeTime(createdAt)
  const nameSize = size === 'md' ? 'text-base' : 'text-sm'
  // 레벨 그림은 다른 화면처럼 이름 바로 앞에 붙인다
  const name = (
    <span className="flex min-w-0 items-center gap-1">
      {nameLeading}
      <span className={cn('font-semibold text-text-primary', nameSize)}>{nickname}</span>
    </span>
  )
  // 빈 프로필은 Avatar 기본값(primary-50 배경 + 발바닥) — 내비·다른 아바타와 같은 색
  const avatar = (
    <Avatar size={size === 'md' ? 'md' : 'sm'}>
      {profileImageUrl ? (
        <AvatarImage src={profileImageUrl} alt={nickname} boxWidth={40} />
      ) : (
        <AvatarFallback />
      )}
    </Avatar>
  )

  if (contentSlot) {
    return (
      <div className={className ?? 'flex items-start gap-2'}>
        <Link href={`/home/${authorId}`} className="shrink-0">
          {avatar}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {name}
            <span className="text-xs font-medium text-neutral-700" suppressHydrationWarning>
              {displayTime}
            </span>
          </div>
          {contentSlot}
        </div>
      </div>
    )
  }

  return (
    <div className={className ?? 'flex items-center gap-2'}>
      <Link href={`/home/${authorId}`} className="flex items-center gap-2">
        {avatar}
        {name}
      </Link>
      <span className="text-xs font-medium text-neutral-700" suppressHydrationWarning>
        {displayTime}
      </span>
    </div>
  )
}

export { AuthorInfo }
