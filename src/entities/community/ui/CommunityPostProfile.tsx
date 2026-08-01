import { PawIcon } from '@/shared/assets/icons'
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

const ShowcaseAvatar = ({ author }: { author: CommunityPreviewAuthor }) => {
  if (author.profileImageUrl) {
    return (
      <ProfileAvatar
        size="responsivePc"
        src={author.profileImageUrl}
        alt={author.nickname}
        className="shrink-0"
      />
    )
  }

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ededed] text-[#a6a6a6] pc:size-10"
      aria-hidden="true"
    >
      <PawIcon className="size-4 pc:size-[1.375rem]" />
    </span>
  )
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
      {showcase ? (
        <ShowcaseAvatar author={author} />
      ) : (
        <ProfileAvatar
          size="responsive"
          src={author.profileImageUrl}
          alt={author.nickname}
          className="shrink-0"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className={cn('flex items-center gap-2', showcase ? 'w-full' : 'p-0.5')}>
          <span
            className={cn(
              'min-w-0 truncate font-semibold text-[#3e3e3e]',
              showcase ? 'p-0.5 text-sm leading-[1.5] pc:text-base' : 'text-body-s',
            )}
          >
            {author.nickname}
          </span>
          <span
            className="shrink-0 text-xs leading-[1.5] font-medium whitespace-nowrap text-[#6b6b6b]"
            suppressHydrationWarning
          >
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm leading-[1.5] font-semibold break-words text-[#3e3e3e]',
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
