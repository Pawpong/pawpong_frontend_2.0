'use client'

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BeforeAfterSlider, ImageCarousel, ProfileAvatar } from '@/shared/ui'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { PostMoreMenu } from './PostMoreMenu'
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
  mediaLayout?: 'photo' | 'compact'
  /** 닉네임 앞 (레벨 그림) */
  nameLeading?: ReactNode
  /** 닉네임 아래 (대표 배지 줄) */
  badgeSlot?: ReactNode
  /** 본문 아래에 둘 기록·주제·태그 줄 */
  metaSlot?: ReactNode
  /** 남의 글 ⋮ 메뉴의 신고 항목 — 다이얼로그는 reportDialog 로 받는다 */
  onReport?: () => void
  reportDialog?: ReactNode
  /** 목록의 첫 카드처럼 LCP 후보인 첫 이미지만 선로딩 */
  preload?: boolean
}

/**
 * 커뮤니티 메인의 본문 우선 피드 카드 (Figma CommunityFeedCard, node 3606:622637)
 * - 작성자 → 본문·사진 → 보조 정보 → 반응. 질문 글은 작은 썸네일을 사용한다.
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
  mediaLayout = 'photo',
  metaSlot,
  onReport,
  reportDialog,
  preload = false,
}: CommunityFeedCardProps) => {
  const [showComparison, setShowComparison] = useState(false)
  const compact = mediaLayout === 'compact' && !aiComparison
  const href = detailHref ?? `/community/post/${postId}`
  const comparison =
    aiComparison && images[aiComparison.beforePhotoIndex] && images[aiComparison.afterPhotoIndex]
      ? aiComparison
      : null
  const mediaImages = comparison
    ? [
        images[comparison.afterPhotoIndex],
        ...images.filter(
          (_, index) =>
            index !== comparison.beforePhotoIndex && index !== comparison.afterPhotoIndex,
        ),
      ]
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
              <span className="min-w-0 truncate text-sm leading-[1.5] font-semibold text-neutral-850">
                {author.nickname}
              </span>
            </span>
            <span className="text-xs leading-[1.5] text-text-secondary" suppressHydrationWarning>
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">{!onDelete && followAction}</div>
      </div>

      <div>
        <CommunityReviewLabel review={aiReview} />
      </div>
      <div className={compact ? 'flex items-start gap-4' : ''}>
        {text && (
          <Link
            href={href}
            prefetch={false}
            className="mb-3 block min-w-0 flex-1 rounded focus-ring"
          >
            <p className="line-clamp-3 text-body-lg leading-relaxed font-normal whitespace-pre-line text-text-primary">
              {text}
            </p>
          </Link>
        )}

        {/* 미디어 — 카드 폭을 채우는 4:3 캐러셀 (여러 장이면 우상단에 장수 배지) */}
        {comparison && showComparison && (
          <BeforeAfterSlider
            beforeSrc={images[comparison.beforePhotoIndex]}
            afterSrc={images[comparison.afterPhotoIndex]}
          />
        )}
        {mediaImages.length > 0 && !showComparison && (
          <div
            className={
              compact
                ? 'relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-xl'
                : 'relative aspect-[4/3] max-h-[26rem] w-full cursor-pointer overflow-hidden rounded-xl'
            }
            role="link"
            tabIndex={0}
            aria-label="게시글 사진 보기"
            onKeyDown={(event) => {
              if (event.target === event.currentTarget && event.key === 'Enter') router.push(href)
            }}
            onPointerDown={handleImagePointerDown}
            onPointerUp={handleImagePointerUp}
          >
            <ImageCarousel
              images={mediaImages}
              alt={author.nickname}
              className="absolute inset-0"
              bgClassName="bg-neutral-50"
              imageClassName={compact ? 'object-cover' : 'object-contain'}
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
      </div>
      {comparison && (
        <button
          type="button"
          aria-expanded={showComparison}
          onClick={() => setShowComparison((shown) => !shown)}
          className="mt-2 min-h-10 self-start rounded-lg px-2 text-sm font-medium text-primary-700 focus-ring hover:bg-primary-50"
        >
          {showComparison ? '결과 사진만 보기' : '원본과 비교'}
        </button>
      )}
      {metaSlot && <div className="mt-2">{metaSlot}</div>}

      {/* 액션 — 댓글 아이콘은 상세 링크 (community/@modal 인터셉트가 이 이동을 모달로 가로챈다) */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <CommunityPostActions
          likeCount={likeCount}
          commentCount={commentCount}
          liked={isLiked}
          onToggleLike={onToggleLike}
          detailHref={href}
        />
        <PostMoreMenu
          orientation="horizontal"
          saved={isSaved}
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
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onDelete ? undefined : onReport}
        />
      </div>
      {reportDialog}
    </article>
  )
}

export { CommunityFeedCard }
