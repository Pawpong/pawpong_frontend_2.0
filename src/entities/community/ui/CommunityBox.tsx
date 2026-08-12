'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MoreVertIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import type { CommunityPreviewAuthor, CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { CommunityPostProfile } from './CommunityPostProfile'

type CommunityBoxAuthor = CommunityPreviewAuthor

interface CommunityBoxProps extends CommunityPreviewProps {
  /** 좋아요·북마크 토글 — features의 ConnectedCommunityBox에서 주입 */
  onToggleLike?: () => void
  onToggleSave?: () => void
  className?: string
}

/**
 * 커뮤니티 게시글 미리보기 카드 — Figma community box -미리보기 view (923:18369).
 * PC large 규격은 407×376이며 이미지 한 장과 좋아요·댓글·북마크 액션을 표시한다.
 */
const CommunityBox = ({
  author,
  createdAt,
  text,
  images = [],
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  detailHref,
  onToggleLike,
  onToggleSave,
  className,
}: CommunityBoxProps) => {
  const primaryImage = images[0]

  const profile = (
    <CommunityPostProfile author={author} createdAt={createdAt} text={text} variant="showcase" />
  )

  const image = (
    <div className="relative size-full overflow-hidden rounded-lg bg-neutral-100 pc:rounded-xl">
      {primaryImage && (
        <Image
          src={primaryImage}
          alt={`${author.nickname}의 게시글 이미지`}
          fill
          sizes="(min-width: 1440px) 383px, (min-width: 768px) 297px, calc(100vw - 64px)"
          className="object-cover"
        />
      )}
    </div>
  )

  return (
    <article
      className={cn(
        'flex h-[20.5625rem] w-[20.0625rem] flex-col items-start overflow-hidden rounded-lg border border-neutral-300 bg-white p-3 pc:h-[23.5rem] pc:w-[25.4375rem]',
        // Figma hover/press (923-18992): 배경 #f6f6f6 + drop shadow
        'transition-[background-color,box-shadow] hover:bg-neutral-50 hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] active:bg-neutral-50 active:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      <header className="flex w-full shrink-0 items-start justify-between py-2 pc:py-3">
        {detailHref ? (
          <Link href={detailHref} className="flex min-w-0 flex-1">
            {profile}
          </Link>
        ) : (
          profile
        )}
        <button
          type="button"
          aria-label="게시글 더보기"
          className="size-6 shrink-0 text-neutral-850"
        >
          <MoreVertIcon className="size-6" />
        </button>
      </header>

      <div className="min-h-0 w-full flex-1">
        {detailHref ? (
          <Link href={detailHref} className="block size-full">
            {image}
          </Link>
        ) : (
          image
        )}
      </div>

      <CommunityPostActions
        likeCount={likeCount}
        commentCount={commentCount}
        liked={isLiked}
        saved={isSaved}
        onToggleLike={onToggleLike}
        onToggleSave={onToggleSave}
      />
    </article>
  )
}

export { CommunityBox }
export type { CommunityBoxAuthor, CommunityBoxProps }
