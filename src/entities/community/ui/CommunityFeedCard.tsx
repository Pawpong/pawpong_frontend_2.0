'use client'

import { useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BeforeAfterSlider, ImageCarousel, OwnerActionsMenu, ProfileAvatar } from '@/shared/ui'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { COMMUNITY_CAROUSEL_STYLE } from '../model/communityUi'
import { CommunityReviewLabel } from './CommunityReviewLabel'

interface CommunityFeedCardProps extends CommunityPreviewProps {
  /** 내 글일 때만 전달 — 더보기가 삭제(및 필요한 화면에서는 수정)로 동작 */
  onEdit?: () => void
  onDelete?: () => void
  /** 좋아요·북마크 토글 — features의 ConnectedFeedCard에서 주입 */
  onToggleLike?: () => void
  onToggleSave?: () => void
  /** 남의 글 헤더 오른쪽에 둘 기능 레이어 액션(팔로우) */
  followAction?: ReactNode
  /** 닉네임 앞 (레벨 그림) */
  nameLeading?: ReactNode
  /** 닉네임 아래 (대표 배지 줄) */
  badgeSlot?: ReactNode
  /** 본문 아래에 둘 기록·주제·태그 줄 */
  metaSlot?: ReactNode
  /** 남의 글 액션 줄 오른쪽 끝에 둘 기능 레이어 액션(신고 깃발) */
  reportAction?: ReactNode
  /** 목록의 첫 카드처럼 LCP 후보인 첫 이미지만 선로딩 */
  preload?: boolean
}

/**
 * 커뮤니티 메인의 본문 우선 피드 카드 (Figma CommunityFeedCard, node 3606:622637)
 * - 헤더 → 본문(최대 4줄) → 기록·주제 줄 → 4:3 사진 캐러셀 → 액션, 카드 사이는 구분선
 */
const CommunityFeedCard = ({
  postId,
  author,
  createdAt,
  text,
  images = [],
  aiComparison,
  aiReview,
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  detailHref,
  shareable,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleSave,
  followAction,
  nameLeading,
  badgeSlot,
  metaSlot,
  reportAction,
  preload = false,
}: CommunityFeedCardProps) => {
  const href = detailHref ?? `/community/post/${postId}`
  const comparison =
    aiComparison && images[aiComparison.beforePhotoIndex] && images[aiComparison.afterPhotoIndex]
      ? aiComparison
      : null
  const mediaImages = comparison
    ? images.filter(
        (_, index) => index !== comparison.beforePhotoIndex && index !== comparison.afterPhotoIndex,
      )
    : images
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
    <article className="flex flex-col overflow-hidden border-b border-neutral-100 bg-white py-6 tab:py-8">
      {/* 헤더 — 아바타·닉네임·작성시각. 작성자 영역은 그 사람의 홈으로 간다 (/home/[userId] 가 입양자·브리더를 가른다) */}
      <div className="flex items-center justify-between gap-2 pb-4">
        <Link
          href={`/home/${author.id}`}
          prefetch={false}
          aria-label={`${author.nickname} 홈으로 가기`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg focus-ring"
        >
          <ProfileAvatar
            size="medium"
            src={author.profileImageUrl}
            alt={author.nickname}
            className="shrink-0"
          />
          <div className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-1">
              {nameLeading}
              <span className="min-w-0 truncate text-sm leading-[1.5] font-semibold text-neutral-850">
                {author.nickname}
              </span>
            </span>
            {badgeSlot}
            <span
              className="text-xs leading-[1.5] font-medium text-neutral-700"
              suppressHydrationWarning
            >
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </Link>
        {onDelete ? <OwnerActionsMenu onEdit={onEdit} onDelete={onDelete} /> : followAction}
      </div>

      <div className="px-3">
        <CommunityReviewLabel review={aiReview} />
      </div>
      {text && (
        <Link href={href} prefetch={false} className="mb-4 block rounded focus-ring">
          <p className="line-clamp-4 text-body-md font-normal whitespace-pre-line text-neutral-850 tab:text-body-lg">
            {text}
          </p>
        </Link>
      )}
      {metaSlot && <div className="mb-4">{metaSlot}</div>}

      {/* 미디어 — 카드 폭을 채우는 4:3 캐러셀 (여러 장이면 우상단에 장수 배지) */}
      {comparison && (
        <BeforeAfterSlider
          beforeSrc={images[comparison.beforePhotoIndex]}
          afterSrc={images[comparison.afterPhotoIndex]}
        />
      )}
      {mediaImages.length > 0 && (
        <div
          className="relative aspect-[4/3] max-h-[26rem] w-full cursor-pointer overflow-hidden rounded-xl"
          onPointerDown={handleImagePointerDown}
          onPointerUp={handleImagePointerUp}
        >
          <ImageCarousel
            images={mediaImages}
            alt={author.nickname}
            className="absolute inset-0"
            bgClassName="bg-neutral-50"
            imageClassName="object-contain"
            preloadFirstImage={preload}
            {...COMMUNITY_CAROUSEL_STYLE} // [refactored] 상세와 공유하는 상수로
          />
          {mediaImages.length > 1 && (
            <span className="pointer-events-none absolute top-2.5 right-3 flex h-6 w-10 items-center justify-center rounded-full bg-neutral-850/90 text-[0.625rem] font-semibold text-white">
              {mediaImages.length}장
            </span>
          )}
        </div>
      )}

      {/* 액션 — 댓글 아이콘은 상세 링크 (community/@modal 인터셉트가 이 이동을 모달로 가로챈다) */}
      <div className="flex items-center justify-between gap-2 pt-4">
        <CommunityPostActions
          likeCount={likeCount}
          commentCount={commentCount}
          liked={isLiked}
          saved={isSaved}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          share={
            shareable && detailHref
              ? {
                  url: detailHref,
                  title: `${author.nickname}님의 게시글`,
                  description: text,
                  imageUrl: images[0],
                }
              : undefined
          }
          detailHref={href}
        />
        {reportAction}
      </div>
    </article>
  )
}

export { CommunityFeedCard }
