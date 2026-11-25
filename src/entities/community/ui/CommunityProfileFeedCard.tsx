'use client'

import type { MouseEventHandler } from 'react'
import Link from 'next/link'
import { FavoriteIcon, MessageIcon } from '@/shared/assets'
import { CardImage } from '@/shared/ui'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { CommunityPostCard } from '@/shared/types'
import { CommunityReviewLabel } from './CommunityReviewLabel'

interface CommunityProfileFeedCardProps {
  post: CommunityPostCard
  preload?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

/**
 * 공개 프로필 홈의 1열 피드 카드 — 둥근 사진(16:10) + 본문 두 줄 + 좋아요·댓글·날짜.
 * 글이 한두 개뿐인 홈도 화면이 비어 보이지 않게, 3열 작은 정사각 격자 대신 쓴다.
 * 사진이 없는 글은 본문만 보인다.
 */
const CommunityProfileFeedCard = ({ post, preload, onClick }: CommunityProfileFeedCardProps) => {
  const imageUrl = post.primaryPhotoUrl ?? post.photoUrls[0]
  const photoCount = post.photoUrls.length
  const text = post.title ?? post.bodyExcerpt

  return (
    <article className="flex flex-col gap-1.5 border-b border-neutral-200 pb-5">
      <Link
        href={`/community/post/${post.postId}`}
        prefetch={false}
        onClick={onClick}
        className="flex flex-col gap-3 rounded-2xl focus-ring"
      >
        {imageUrl && (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-neutral-150">
            <CardImage
              src={imageUrl}
              alt=""
              sizes="(max-width: 767px) 100vw, 40rem"
              preload={preload}
            />
            {/* 여러 장일 때만 첫 장 기준 1/N */}
            {photoCount > 1 && (
              <span className="absolute top-2.5 right-2.5 rounded-full bg-neutral-850/70 px-2 py-0.5 text-xs font-semibold text-white">
                1/{photoCount}
              </span>
            )}
            {post.aiReview?.state === 'held' && (
              <span className="absolute right-2.5 bottom-2.5 left-2.5">
                <CommunityReviewLabel review={post.aiReview} />
              </span>
            )}
          </div>
        )}
        {text && (
          <p className="line-clamp-2 text-sm leading-[1.5] font-medium break-words text-neutral-850">
            {text}
          </p>
        )}
      </Link>
      <p className="flex items-center gap-1 text-xs text-neutral-700">
        <FavoriteIcon aria-hidden className="size-4" />
        <span className="sr-only">좋아요</span>
        {post.likeCount}
        <span aria-hidden className="text-neutral-300">
          ·
        </span>
        <MessageIcon aria-hidden className="size-4" />
        <span className="sr-only">댓글</span>
        {post.commentCount}
        <span aria-hidden className="text-neutral-300">
          ·
        </span>
        <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
      </p>
    </article>
  )
}

export { CommunityProfileFeedCard }
