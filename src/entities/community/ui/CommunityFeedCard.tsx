'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { FAVORITE_ACTIVE, ImageCarousel, OwnerActionsMenu, ProfileAvatar } from '@/shared/ui'
import { FavoriteIcon, MoreVertIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { COMMUNITY_CAROUSEL_STYLE } from '../model/communityUi'

interface CommunityFeedCardProps extends CommunityPreviewProps {
  /** 내 글일 때만 전달 — 더보기가 수정/삭제로 동작 */
  onEdit?: () => void
  onDelete?: () => void
  /** 좋아요·북마크 토글 — features의 ConnectedFeedCard에서 주입 */
  onToggleLike?: () => void
  onToggleSave?: () => void
  className?: string
}

/**
 * 인스타그램식 단일 컬럼 피드 카드 (Figma CommunityFeedCard, node 3606:622637)
 * - 이미지가 있으면 1:1 캐러셀, 없으면 본문을 큼직하게
 * - 모바일은 화면 끝까지 닿도록 모서리를 각지게, tab부터 둥글린다
 */
const CommunityFeedCard = ({
  postId,
  author,
  createdAt,
  text,
  images = [],
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  detailHref,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleSave,
  className,
}: CommunityFeedCardProps) => {
  const href = detailHref ?? `/community/post/${postId}`
  const hasImages = images.length > 0
  const [showHeartPop, setShowHeartPop] = useState(false)
  const lastTapRef = useRef(0)

  // 인스타그램식 더블탭 좋아요 — 이미 눌러둔 글은 해제하지 않고 애니메이션만 다시 보여준다.
  // 캐러셀 스와이프와 겹치지 않도록 짧은 두 번의 탭(300ms)만 인식한다.
  const handleImageTap = () => {
    const now = Date.now()
    const isDoubleTap = now - lastTapRef.current < 300
    lastTapRef.current = isDoubleTap ? 0 : now
    if (!isDoubleTap) return

    setShowHeartPop(false)
    requestAnimationFrame(() => setShowHeartPop(true))
    if (!isLiked) onToggleLike?.()
  }

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-none bg-white tab:rounded-2xl',
        className,
      )}
    >
      {/* 헤더 — 아바타·닉네임·작성시각 */}
      <div className="flex items-center justify-between gap-2 p-3">
        <Link href={href} prefetch={false} className="flex min-w-0 flex-1 items-center gap-2">
          <ProfileAvatar
            size="medium"
            src={author.profileImageUrl}
            alt={author.nickname}
            className="shrink-0"
          />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-[1.5] font-semibold text-neutral-850">
              {author.nickname}
            </span>
            <span
              className="text-xs leading-[1.5] font-medium text-neutral-500"
              suppressHydrationWarning
            >
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </Link>
        {onEdit && onDelete ? (
          <OwnerActionsMenu
            onEdit={onEdit}
            onDelete={onDelete}
            className="shrink-0 text-neutral-850"
          />
        ) : (
          // ponytail: 남의 글 더보기는 액션 미정(신고 등) — 스펙 나오면 여기 연결
          <button type="button" aria-label="더보기" className="shrink-0 p-1">
            <MoreVertIcon className="size-6 text-neutral-850" />
          </button>
        )}
      </div>

      {/* 미디어 — 카드 폭을 채우는 1:1 캐러셀 (여러 장이면 우상단에 장수 배지) */}
      {hasImages ? (
        <div
          className="relative aspect-square w-full overflow-hidden rounded-lg"
          onPointerUp={handleImageTap}
        >
          <ImageCarousel
            images={images}
            alt={author.nickname}
            className="absolute inset-0"
            bgClassName="bg-neutral-700"
            imageClassName="object-cover"
            {...COMMUNITY_CAROUSEL_STYLE} // [refactored] 상세와 공유하는 상수로
          />
          {showHeartPop && (
            <FavoriteIcon
              status="fill"
              aria-hidden
              onAnimationEnd={() => setShowHeartPop(false)}
              // [refactored] 하드코딩 #ff8181 → shared/ui의 FAVORITE_ACTIVE
              className={cn(
                'animate-heart-pop pointer-events-none absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg',
                FAVORITE_ACTIVE,
              )}
            />
          )}
          {images.length > 1 && (
            <span className="pointer-events-none absolute top-2.5 right-3 flex h-6 w-10 items-center justify-center rounded-full bg-neutral-850/90 text-[0.625rem] font-semibold text-white">
              {images.length}장
            </span>
          )}
        </div>
      ) : (
        <Link href={href} prefetch={false} className="block px-3 py-5">
          <p className="line-clamp-6 text-base leading-[1.5] font-semibold whitespace-pre-line text-neutral-850">
            {text}
          </p>
        </Link>
      )}

      {/* 액션 — 댓글 아이콘은 상세 링크 (community/@modal 인터셉트가 이 이동을 모달로 가로챈다) */}
      <div className="px-3 py-2">
        <CommunityPostActions
          likeCount={likeCount}
          commentCount={commentCount}
          liked={isLiked}
          saved={isSaved}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          detailHref={href}
        />
      </div>

      {/* 캡션 — 이미지가 있을 때만 (없으면 위에서 본문을 이미 보여줬다) */}
      {hasImages && (
        <Link href={href} prefetch={false} className="block px-3 pb-3">
          <p className="flex items-center gap-3 overflow-hidden">
            <span className="shrink-0 text-sm leading-[1.5] font-semibold text-neutral-850">
              {author.nickname}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs leading-[1.5] font-semibold text-neutral-850">
              {text}
            </span>
          </p>
        </Link>
      )}
    </article>
  )
}

export { CommunityFeedCard }
