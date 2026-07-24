'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BOOKMARK_ACTIVE, PostActionButton, ProfileAvatar, ProfileHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import {
  FavoriteIcon,
  PixelMessageIcon,
  PixelBookmarkIcon,
  MoreVertIcon,
} from '@/shared/assets/icons'

interface PostCardAuthor {
  id: string
  nickname: string
  profileImageUrl?: string
}

interface PostCardProps {
  author: PostCardAuthor
  /** 작성 시각 — ISO 문자열이면 상대 시간으로 변환, 이미 포맷된 문자열은 그대로 표시 */
  createdAt: string
  /** 본문 미리보기 (이미지 있으면 1줄, 없으면 최대 5줄) */
  text: string
  images?: string[]
  likeCount: number
  commentCount: number
  /** 게시글 상세 링크 (있으면 본문 영역이 링크) */
  detailHref?: string
  /** 지정 시 헤더를 공통 ProfileHeader로 렌더 + 이미지 tab 상단패딩 제거 (저장피드 sm / 홈 쇼케이스 responsivePc) */
  profileType?: 'sm' | 'md' | 'responsivePc'
  /** 미리보기 끝에 [더보기] 라벨 노출 (profileType과 함께 사용) */
  showMore?: boolean
  className?: string
}

/**
 * 커뮤니티 게시글 카드 (Figma node 1054-28522 · community box -게시글)
 * - 헤더: 아바타 + [이름·작성시각] / 본문 미리보기 + 더보기(⋯)
 * - 이미지: 가로 스크롤 (모바일 281×211 / 탭·PC 320×240)
 * - 액션: 좋아요 · 댓글 · 북마크 (32px)
 */
const PostCard = ({
  author,
  createdAt,
  text,
  images = [],
  likeCount,
  commentCount,
  detailHref,
  profileType,
  showMore,
  className,
}: PostCardProps) => {
  const hasImages = images.length > 0
  // ponytail: API 미연결 — 좋아요/북마크는 로컬 상태로 색 토글만. 연결 시 mutation으로 교체.
  const [liked, setLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const profileCluster = (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <ProfileAvatar
        size="responsive"
        src={author.profileImageUrl}
        alt={author.nickname}
        className="shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2 p-0.5">
          <span className="truncate text-body-s font-semibold text-[#3e3e3e]">
            {author.nickname}
          </span>
          <span
            className="shrink-0 text-xs leading-[1.5] font-medium text-[#6b6b6b]"
            suppressHydrationWarning
          >
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        <p
          className={cn(
            'text-sm leading-[1.5] font-semibold break-words text-[#3e3e3e]',
            hasImages ? 'truncate' : 'line-clamp-5',
          )}
        >
          {text}
        </p>
      </div>
    </div>
  )

  return (
    <article className={cn('flex flex-col py-3 tab:p-3', className)}>
      {/* 헤더: profileType 지정 시 공통 ProfileHeader, 아니면 기본 인라인 헤더 */}
      {profileType ? (
        <ProfileHeader
          type={profileType}
          nickname={author.nickname}
          createdAt={createdAt}
          preview={text}
          profileImageUrl={author.profileImageUrl}
          detailHref={detailHref}
          showMore={showMore}
          className="p-2  pc:px-0"
        />
      ) : (
        <div className="flex items-start justify-between gap-4 py-2 tab:py-3">
          {detailHref ? (
            <Link href={detailHref} className="flex min-w-0 flex-1">
              {profileCluster}
            </Link>
          ) : (
            profileCluster
          )}
          <button type="button" aria-label="더보기" className="shrink-0">
            <MoreVertIcon className="size-6 text-[#3e3e3e]" />
          </button>
        </div>
      )}

      {/* 이미지 (가로 스크롤) — 저장피드(profileType)는 상단패딩 제거 */}
      {hasImages && (
        <div className={cn('flex gap-3 overflow-x-auto pt-3 pc:pt-3', profileType && 'pt-0')}>
          {images.map((src, index) => (
            <div
              key={index}
              className="relative h-[13.1875rem] w-[17.5625rem] shrink-0 overflow-hidden rounded-lg bg-[#6b6b6b] tab:h-60 tab:w-80"
            >
              {src && (
                <Image src={src} alt={`게시글 이미지 ${index + 1}`} fill className="object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* 액션: 좋아요 · 댓글 · 북마크 (픽셀 아이콘) */}
      <div className="flex items-center gap-2">
        {/* [refactored] 자체 Stat → 공통 PostActionButton (카운트 색·간격 Figma 통일) */}
        <PostActionButton
          icon={FavoriteIcon}
          count={likeCount + (liked ? 1 : 0)}
          iconClassName="size-8"
          ariaLabel="좋아요"
          active={liked}
          onClick={() => setLiked((prev) => !prev)}
        />
        <PostActionButton icon={PixelMessageIcon} count={commentCount} iconClassName="size-8" />
        {/* [refactored] 자체 북마크 버튼 → 공통 PostActionButton (active 색·a11y 통일) */}
        <PostActionButton
          icon={PixelBookmarkIcon}
          iconClassName="size-8"
          ariaLabel="북마크"
          active={isBookmarked}
          activeClassName={BOOKMARK_ACTIVE}
          onClick={() => setIsBookmarked((prev) => !prev)}
        />
      </div>
    </article>
  )
}

export { PostCard }
