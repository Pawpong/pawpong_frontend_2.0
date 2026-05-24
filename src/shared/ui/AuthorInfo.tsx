import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

interface AuthorInfoProps {
  authorId: string
  nickname: string
  profileImageUrl?: string
  createdAt: string
  className?: string
  /** avatar 아래에 추가 콘텐츠 (댓글 본문 등) */
  contentSlot?: React.ReactNode
}

const AuthorInfo = ({
  authorId,
  nickname,
  profileImageUrl,
  createdAt,
  className,
  contentSlot,
}: AuthorInfoProps) => {
  const avatar = (
    <Avatar size="sm">
      {profileImageUrl ? (
        <AvatarImage src={profileImageUrl} alt={nickname} />
      ) : (
        <AvatarFallback className="bg-fill-muted" />
      )}
    </Avatar>
  )

  if (contentSlot) {
    return (
      <div className={className ?? 'flex items-start gap-3'}>
        <Link href={`/home/${authorId}`} className="shrink-0">
          {avatar}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-text-primary">{nickname}</span>
            <span className="text-xs font-bold text-text-secondary">{createdAt}</span>
          </div>
          {contentSlot}
        </div>
      </div>
    )
  }

  return (
    <div className={className ?? 'flex items-center gap-2.5'}>
      <Link href={`/home/${authorId}`} className="flex items-center gap-3">
        {avatar}
        <span className="text-sm font-bold text-text-primary">{nickname}</span>
      </Link>
      <span className="text-xs font-bold text-text-secondary">{createdAt}</span>
    </div>
  )
}

export { AuthorInfo }
