'use client'

import { VoteIcon } from '@/shared/assets'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import { MediaDialog } from './MediaDialog'
import { ModalPhoto } from './ModalPhoto'
import { DetailLink } from './DetailLink'
import { ProfileAvatar } from './ProfileAvatar'
import { Button } from './Button'

interface ImageDetailProfile {
  nickname: string
  avatarUrl?: string
  /** 애정도 등 배지 텍스트 */
  badgeText?: string
  /** "브리더홈" 이동 링크 */
  homeHref?: string
}

interface ImageDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  initialIndex?: number
  /** 상단 프로필 헤더 (없으면 미노출) */
  profile?: ImageDetailProfile
  /** 투표 수 (없으면 투표 수 영역 미노출) */
  voteCount?: number
  /** "이미지에 투표하였습니다." 문구 노출 여부 */
  showVoteStatus?: boolean
  onVote?: (index: number) => void
  /** 대표이미지 뱃지를 붙일 인덱스 */
  representativeIndex?: number
  /** 이미지 하단 설명 */
  description?: string
}

const ImageDetailModal = ({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  profile,
  voteCount,
  showVoteStatus = false,
  onVote,
  representativeIndex,
  description,
}: ImageDetailModalProps) => {
  // [refactored] voted(deprecated)·footer·showActions·className 은 호출부 어디서도 안 써서 제거
  const { currentIndex, handlePrev, handleNext, handleKeyDown } = useImageCarousel(
    images,
    initialIndex,
  )
  return (
    <MediaDialog
      open={open}
      onOpenChange={onOpenChange}
      title="사진 상세"
      fitContent
      onKeyDown={handleKeyDown}
    >
      {profile && (
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 tab:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <ProfileAvatar src={profile.avatarUrl} alt={profile.nickname} size="small" />
            <span className="truncate text-body-md font-semibold text-neutral-850">
              {profile.nickname}
            </span>
            {profile.badgeText && (
              <span className="shrink-0 rounded-full bg-primary-50 px-2 py-1 text-body-sm font-medium text-primary-700">
                {profile.badgeText}
              </span>
            )}
          </div>
          {profile.homeHref && (
            <DetailLink
              href={profile.homeHref}
              label="브리더홈"
              size="md"
              className="shrink-0 text-primary-500"
            />
          )}
        </div>
      )}
      <ModalPhoto
        images={images}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        representativeIndex={representativeIndex}
      />
      {(description || voteCount !== undefined || showVoteStatus) && (
        <div className="min-h-0 space-y-4 overflow-y-auto border-t border-neutral-100 px-5 py-4 tab:px-6">
          {description && (
            <p className="text-body-md leading-relaxed font-medium whitespace-pre-wrap text-neutral-700">
              {description}
            </p>
          )}
          {(voteCount !== undefined || showVoteStatus) && (
            <div className="flex flex-col gap-3 tab:flex-row tab:items-center tab:justify-between">
              {voteCount !== undefined && (
                <Button
                  variant={onVote ? 'primary' : 'outline'}
                  size="lg"
                  onClick={() => onVote?.(currentIndex)}
                  disabled={!onVote || !images.length}
                  aria-label={
                    onVote ? `사진에 투표하기, 현재 ${voteCount}표` : `현재 ${voteCount}표`
                  }
                  className="w-full gap-2 px-6 text-body-lg disabled:cursor-default disabled:opacity-100 tab:w-64"
                >
                  <VoteIcon className="size-6" />
                  {onVote ? '투표하기' : '받은 투표'}
                  <span className="text-body-md font-medium">{voteCount}표</span>
                </Button>
              )}
              {showVoteStatus && (
                <p role="status" className="text-body-md font-medium text-primary-500">
                  투표한 사진이에요.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </MediaDialog>
  )
}

export { ImageDetailModal, type ImageDetailModalProps, type ImageDetailProfile }
