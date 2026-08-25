'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageCarousel, OwnerActionsMenu, ProfileAvatar } from '@/shared/ui'
import { MoreVertIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { COMMUNITY_CAROUSEL_STYLE } from '../model/communityUi'

interface CommunityFeedCardProps extends CommunityPreviewProps {
  /** 내 글일 때만 전달 — 더보기가 삭제(및 필요한 화면에서는 수정)로 동작 */
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
  const router = useRouter()
  // 사진 한 번 탭으로 상세 진입. Link로 감싸면 캐러셀 스와이프와 화살표·점 조작이 막히므로,
  // 포인터 이동 거리로 드래그(스와이프)를 걸러내고 캐러셀 컨트롤 클릭은 무시한다.
  const pointerStart = useRef<{ x: number; y: number } | null>(null)

  const handleImagePointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY }
  }

  const handleImagePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start) return

    // 스와이프는 진입으로 치지 않는다 (10px 이상 움직이면 드래그로 본다)
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (moved > 10) return
    // 화살표·점 인디케이터 클릭은 캐러셀 조작이라 통과시킨다
    if ((event.target as HTMLElement).closest('button')) return

    router.push(href)
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
        {onDelete ? (
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
          className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg"
          onPointerDown={handleImagePointerDown}
          onPointerUp={handleImagePointerUp}
        >
          <ImageCarousel
            images={images}
            alt={author.nickname}
            className="absolute inset-0"
            bgClassName="bg-neutral-700"
            imageClassName="object-cover"
            {...COMMUNITY_CAROUSEL_STYLE} // [refactored] 상세와 공유하는 상수로
          />
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
