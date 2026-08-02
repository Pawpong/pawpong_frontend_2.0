import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import { ProfileAvatar } from '@/shared/ui'
import type { CommunityPreviewAuthor } from '../model/communityPreview'

interface CommunityPostProfileProps {
  author: CommunityPreviewAuthor
  createdAt: string
  text: string
  variant: 'feed' | 'showcase'
  hasImages?: boolean
}

const CommunityPostProfile = ({
  author,
  createdAt,
  text,
  variant,
  hasImages,
}: CommunityPostProfileProps) => {
  const showcase = variant === 'showcase'

  return (
    <div className={cn('flex min-w-0 flex-1 items-start gap-2', showcase && 'pc:h-[3.0625rem]')}>
      {/* [refactored] ShowcaseAvatar 제거 — ProfileAvatar 폴백(paw)으로 통일 */}
      <ProfileAvatar
        size={showcase ? 'responsivePc' : 'responsive'}
        src={author.profileImageUrl}
        alt={author.nickname}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className={cn('flex items-center gap-2', showcase ? 'w-full' : 'p-0.5')}>
          <span
            className={cn(
              'min-w-0 truncate font-semibold text-neutral-850',
              showcase ? 'p-0.5 text-sm leading-[1.5] pc:text-base' : 'text-body-s',
            )}
          >
            {author.nickname}
          </span>
          <span
            className="shrink-0 text-xs leading-[1.5] font-medium whitespace-nowrap text-neutral-700"
            suppressHydrationWarning
          >
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm leading-[1.5] font-semibold break-words text-neutral-850',
            showcase ? 'w-full truncate' : hasImages ? 'truncate' : 'line-clamp-5',
          )}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

export { CommunityPostProfile }
