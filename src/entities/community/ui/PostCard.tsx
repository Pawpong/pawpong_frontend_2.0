'use client'

import Image from 'next/image'
import Link from 'next/link'
import { OwnerActionsMenu, ProfileHeader, TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { MoreVertIcon } from '@/shared/assets'
import type { CommunityPreviewProps } from '../model/communityPreview'
import { CommunityPostActions } from './CommunityPostActions'
import { CommunityPostProfile } from './CommunityPostProfile'

interface PostCardProps extends CommunityPreviewProps {
  /** 지정 시 헤더를 공통 ProfileHeader로 렌더 + 이미지 tab 상단패딩 제거 (저장피드 sm / 홈 쇼케이스 responsivePc) */
  profileType?: 'sm' | 'md' | 'responsivePc'
  /** 미리보기 끝에 [더보기] 라벨 노출 (profileType과 함께 사용) */
  showMore?: boolean
  /** 댓글 미리보기 (작성자·본문 1줄) — 없으면 미노출 */
  commentPreview?: { nickname: string; body: string }
  /** 내 글일 때만 전달 — ⋯ 메뉴가 삭제(및 필요한 화면에서는 수정)로 동작 */
  onEdit?: () => void
  onDelete?: () => void
  /** 좋아요·북마크 토글 — features의 ConnectedPostCard에서 주입 */
  onToggleLike?: () => void
  onToggleSave?: () => void
  className?: string
}

/** 이미지 가로 스크롤 — detailHref 있으면 행 전체(빈 영역 포함)가 상세 진입 링크 */
const ImagesRow = ({
  images,
  detailHref,
  className,
}: {
  images: string[]
  detailHref?: string
  className?: string
}) => {
  const row = (
    <div className={cn('flex gap-3 overflow-x-auto', className)}>
      {images.map((src, index) => (
        <div
          key={index}
          className="relative h-[13.1875rem] w-[17.5625rem] shrink-0 overflow-hidden rounded-lg bg-neutral-700 tab:h-60 tab:w-80"
        >
          {src && (
            <Image
              src={src}
              alt={`게시글 이미지 ${index + 1}`}
              fill
              sizes="(max-width: 768px) 281px, 320px"
              className="object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )

  return detailHref ? (
    <Link href={detailHref} className="block">
      {row}
    </Link>
  ) : (
    row
  )
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
  isLiked,
  isSaved,
  detailHref,
  profileType,
  showMore,
  commentPreview,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleSave,
  className,
}: PostCardProps) => {
  const hasImages = images.length > 0

  const profileCluster = (
    <CommunityPostProfile
      author={author}
      createdAt={createdAt}
      text={text}
      variant="feed"
      hasImages={hasImages}
    />
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
          className="p-2 pc:px-0"
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
          {onDelete ? (
            <OwnerActionsMenu
              onEdit={onEdit}
              onDelete={onDelete}
              className="shrink-0 text-neutral-850"
            />
          ) : (
            // ponytail: 남의 글 ⋯ 는 액션 미정(신고 등) — 스펙 나오면 여기 연결
            <button type="button" aria-label="더보기" className="shrink-0">
              <MoreVertIcon className="size-6 text-neutral-850" />
            </button>
          )}
        </div>
      )}

      {/* 이미지 + 액션 — 사진↔아이콘 8px gap */}
      <div className="flex flex-col gap-2">
        {/* 이미지 (가로 스크롤) — 저장피드(profileType)는 상단패딩 제거 */}
        {hasImages && (
          <ImagesRow
            images={images}
            detailHref={detailHref}
            className={cn('pt-3 pc:pt-3', profileType && 'pt-0')}
          />
        )}

        {/* 액션 + 댓글 미리보기 — 아이콘↔댓글 4px gap */}
        <div className="flex flex-col gap-1">
          {/* 액션: 좋아요 · 댓글 · 북마크 (픽셀 아이콘) */}
          <CommunityPostActions
            likeCount={likeCount}
            commentCount={commentCount}
            liked={isLiked}
            saved={isSaved}
            onToggleLike={onToggleLike}
            onToggleSave={onToggleSave}
            detailHref={detailHref}
          />

          {/* 댓글 미리보기 (Figma community-profile 2596-231732) — 작성자 + 본문 1줄 + [더보기] */}
          {commentPreview && (
            <div className="flex items-center gap-2">
              <TextLabel size="14">{commentPreview.nickname}</TextLabel>
              <div className="flex min-w-0 flex-1 items-center gap-2 text-xs leading-[1.5]">
                <p className="truncate font-semibold text-neutral-850">{commentPreview.body}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export { PostCard }
