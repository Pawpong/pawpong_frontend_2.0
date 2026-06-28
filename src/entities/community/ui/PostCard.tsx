'use client'

import { useState, type ComponentType, type SVGProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileAvatar, ProfileHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
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
  /** 작성 시각 (이미 포맷된 문자열) */
  createdAt: string
  /** 본문 미리보기 (이미지 있으면 1줄, 없으면 최대 5줄) */
  text: string
  images?: string[]
  likeCount: number
  commentCount: number
  /** 게시글 상세 링크 (있으면 본문 영역이 링크) */
  detailHref?: string
  /** 지정 시 헤더를 공통 ProfileHeader(아바타 32/40·미리보기 1줄)로 렌더 + 이미지 tab 상단패딩 제거 (저장피드용) */
  profileType?: 'sm' | 'md'
  className?: string
}

// 좋아요·댓글 카운트 (픽셀 아이콘 32 #a6a6a6 + 카운트 14px 볼드 #3e3e3e)
const Stat = ({
  icon: Icon,
  count,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  count: number
}) => (
  <div className="flex items-center gap-1">
    <Icon className="size-8 text-[#a6a6a6]" />
    <span className="text-sm leading-[1.5] font-semibold text-[#3e3e3e]">{count}</span>
  </div>
)

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
  className,
}: PostCardProps) => {
  const hasImages = images.length > 0
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
          <span className="truncate text-sm leading-[1.5] font-semibold text-[#3e3e3e] tab:text-base">
            {author.nickname}
          </span>
          <span className="shrink-0 text-xs leading-[1.5] font-medium text-[#6b6b6b]">
            {createdAt}
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
          className="py-2 tab:py-3"
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
        <div className={cn('flex gap-3 overflow-x-auto pt-3', profileType && 'pt-0')}>
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
        <Stat icon={FavoriteIcon} count={likeCount} />
        <Stat icon={PixelMessageIcon} count={commentCount} />
        <button
          type="button"
          aria-label="북마크"
          aria-pressed={isBookmarked}
          onClick={() => setIsBookmarked((prev) => !prev)}
          className="shrink-0"
        >
          {/* 활성(저장) 시 브랜드 브라운 #a9835a */}
          <PixelBookmarkIcon
            className={cn('size-8', isBookmarked ? 'text-[#a9835a]' : 'text-[#a6a6a6]')}
          />
        </button>
      </div>
    </article>
  )
}

export { PostCard }
