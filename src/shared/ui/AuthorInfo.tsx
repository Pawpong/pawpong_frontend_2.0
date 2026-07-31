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
  /** avatar 아래에 추가 콘텐츠 (댓글 본문 등) */
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
}: AuthorInfoProps) => {
  // ISO 시간은 상대 시간("N시간 전")으로 표시. 목업 문자열은 그대로 통과.
  const displayTime = formatRelativeTime(createdAt)
  const nameSize = size === 'md' ? 'text-base' : 'text-sm'
  const avatar = (
    <Avatar size={size === 'md' ? 'md' : 'sm'}>
      {profileImageUrl ? (
        <AvatarImage src={profileImageUrl} alt={nickname} />
      ) : (
        <AvatarFallback className="bg-fill-muted" />
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
            <span className={cn('font-semibold text-text-primary', nameSize)}>{nickname}</span>
            <span className="text-xs font-medium text-text-secondary" suppressHydrationWarning>
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
        <span className={cn('font-semibold text-text-primary', nameSize)}>{nickname}</span>
      </Link>
      <span className="text-xs font-medium text-text-secondary" suppressHydrationWarning>
        {displayTime}
      </span>
    </div>
  )
}

export { AuthorInfo }
