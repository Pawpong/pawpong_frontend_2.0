'use client'

import Link from 'next/link'
import type { CommunityPreviewProps } from '@/entities/community'
import { useToggleCommunityPostBookmark, useToggleCommunityPostLike } from '@/features/community'
import {
  FavoriteIcon,
  MoreVertIcon,
  PixelBookmarkIcon,
  PixelMessageIcon,
} from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import { CommunityAvatar } from './CommunityAvatar'
import { PostImageCarousel } from './PostImageCarousel'

type CommunityFeedCardProps = CommunityPreviewProps

// Figma icon press 상태 색 — shared/ui를 거치지 않고 이 페이지 안에서 직접 관리
const LIKE_ACTIVE = 'text-[#ff8181]'
const BOOKMARK_ACTIVE = 'text-[#a9835a]'
const ICON_DEFAULT = 'text-neutral-500'

/**
 * 최은진: 신규 파일 — CommunityContent의 게시판형 카드(ConnectedPostCard)를
 * 인스타그램형 단일 컬럼 피드 카드로 교체하면서 만든 컴포넌트.
 * 커뮤니티 홈(/community) 전용 피드 카드 — Figma "CommunityFeedCard" 컴포넌트
 * (node 3606:622637, img/txt 베리언트) 그대로 구현. 노드를 직접 읽어 검증한 값:
 * - 카드 자체는 보더 없음(strokes: []) — 대신 이미지에 8px 라운드가 별도로 있다.
 * - 캐러셀 화살표 버튼은 32px(4px 패딩+24px 아이콘), 배경 rgba(62,62,62,0.9).
 * - 점 인디케이터: 활성=20×8px 필(포인트 옐로우), 비활성=8px 원(포인트 옐로우 20%).
 * - "N장" 배지는 40×24px 고정.
 * - 좋아요/댓글/북마크 픽셀 아이콘은 앱 아이콘(FavoriteIcon 등)과 이미 1:1로 동일.
 *
 * shared/ui의 ProfileAvatar·PostActionButton은 쓰지 않는다 — 이 카드는 피그마 커뮤니티
 * 컴포넌트에만 의존하도록 두어서, shared/ui가 다른 화면 사정으로 바뀌어도 이 카드는
 * 영향받지 않고, 반대로 이 카드를 피그마에 맞춰 고쳐도 다른 화면에 번지지 않는다.
 * (아이콘 SVG는 자산일 뿐이라 shared/assets/icons를 그대로 재사용한다.)
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
}: CommunityFeedCardProps) => {
  const href = detailHref ?? `/community/${postId}`
  const { toggleLike } = useToggleCommunityPostLike(postId, isLiked)
  const { toggleBookmark } = useToggleCommunityPostBookmark(postId, isSaved)
  const hasImages = images.length > 0

  return (
    // 최은진: mo에서는 카드 모서리를 각지게(rounded-none) 해서 화면 끝까지 꽉 차 보이게 하고,
    // tab부터 다시 rounded-2xl로 둥글린다 — Container 쪽 mo 좌우 여백 제거와 짝을 이루는 변경.
    <article className="flex flex-col overflow-hidden rounded-none bg-white tab:rounded-2xl">
      {/* 헤더 — 아바타·닉네임·작성시각 (Figma "header" / community-profile) */}
      <div className="flex items-center justify-between gap-2 p-3">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-2">
          <CommunityAvatar src={author.profileImageUrl} alt={author.nickname} />
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
        {/* ponytail: 남의 글 ⋯ 는 액션 미정(신고 등) — 스펙 나오면 여기 연결 */}
        <button type="button" aria-label="더보기" className="shrink-0 p-1">
          <MoreVertIcon className="size-6 text-neutral-850" />
        </button>
      </div>

      {/* 미디어 — 이미지가 있으면 카드 폭 가득 채운 1:1 캐러셀(모서리 8px 라운드,
          좌우 화살표 32px + 점 인디케이터), 없으면 텍스트를 큼직하게. */}
      {hasImages ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <PostImageCarousel
            images={images}
            alt={author.nickname}
            className="absolute inset-0"
            bgClassName="bg-neutral-700"
            imageClassName="object-cover"
            buttonClassName="size-8 bg-neutral-850/90 hover:bg-neutral-850"
            activeDotClassName="h-2 w-5 rounded-full bg-point-500"
            inactiveDotClassName="size-2 rounded-full bg-point-500/20"
          />
          {images.length > 1 && (
            <span className="pointer-events-none absolute top-2.5 right-3 flex h-6 w-10 items-center justify-center rounded-full bg-neutral-850/90 text-[0.625rem] font-semibold text-white">
              {images.length}장
            </span>
          )}
        </div>
      ) : (
        <Link href={href} className="block px-3 py-5">
          <p className="line-clamp-6 text-base leading-[1.5] font-semibold whitespace-pre-line text-neutral-850">
            {text}
          </p>
        </Link>
      )}

      {/* 액션 (Figma "community-icon" — px-12 py-8, gap-8) */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          aria-label="좋아요"
          onClick={toggleLike}
          className={cn('flex items-center gap-1', isLiked ? LIKE_ACTIVE : ICON_DEFAULT)}
        >
          <FavoriteIcon status={isLiked ? 'fill' : 'default'} className="size-8" />
          <span className="text-sm leading-[1.5] font-semibold text-neutral-850">{likeCount}</span>
        </button>

        {/* 댓글 아이콘 — 인스타그램 웹처럼 클릭하면 피드는 그대로 두고 상세를 모달로 띄운다
            (community/@modal 인터셉트 라우트가 이 Link 클릭을 가로챈다) */}
        <Link
          href={href}
          aria-label="댓글 보기"
          className={cn('flex items-center gap-1', ICON_DEFAULT)}
        >
          <PixelMessageIcon className="size-8" />
          <span className="text-sm leading-[1.5] font-semibold text-neutral-850">
            {commentCount}
          </span>
        </Link>

        <button
          type="button"
          aria-label="북마크"
          onClick={toggleBookmark}
          className={isSaved ? BOOKMARK_ACTIVE : ICON_DEFAULT}
        >
          <PixelBookmarkIcon className="size-8" />
        </button>
      </div>

      {/* 캡션 (Figma "community-profile" — 라벨(닉네임) + 본문, 한 줄 말줄임) */}
      {hasImages && (
        <Link href={href} className="block px-3 pb-3">
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
