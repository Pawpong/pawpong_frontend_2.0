'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '@/shared/ui'
import { ProfileAvatar } from './ProfileAvatar'
import { Badge } from './Badge'
import { DetailLink } from './DetailLink'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import { VoteIcon, CloseIcon, ArrowBackIcon, PixelArrowRightIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

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
  /** 투표 수 (없으면 투표 영역 미노출) */
  voteCount?: number
  /** 이미 투표한 상태면 확인 문구 노출 */
  voted?: boolean
  onVote?: (index: number) => void
  /** 대표이미지 뱃지를 붙일 인덱스 */
  representativeIndex?: number
  /** 이미지 하단 설명 오버레이 */
  description?: string
  /** 하단 버튼 영역 (다음/버튼 등 컨텍스트마다 다름) */
  footer?: ReactNode
}

const ImageDetailModal = ({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  profile,
  voteCount,
  voted,
  onVote,
  representativeIndex,
  description,
  footer,
}: ImageDetailModalProps) => {
  const { currentIndex, handlePrev, handleNext } = useImageCarousel(images, initialIndex)
  const hasCarousel = images.length > 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex h-[40.875rem] max-h-[90vh] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden bg-[#121212] pc:rounded-[1.25rem]"
        >
          <DialogPrimitive.Title className="sr-only">이미지 상세 보기</DialogPrimitive.Title>

          {/* 상단: 투표 정보 + 닫기 */}
          <div className="flex items-center gap-5 px-6 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 text-[#f6f6f6]">
              {voted && (
                <span className="flex items-center gap-0.5 text-base font-semibold">
                  <VoteIcon className="size-6" />
                  이미지에 투표하였습니다.
                </span>
              )}
              {voteCount !== undefined && (
                <button
                  type="button"
                  onClick={() => onVote?.(currentIndex)}
                  disabled={!onVote}
                  className="flex items-center gap-0.5 text-base font-semibold disabled:cursor-default"
                >
                  <VoteIcon className="size-6" />
                  {voteCount}
                </button>
              )}
            </div>
            <DialogClose aria-label="닫기">
              <CloseIcon className="size-6 text-[#f6f6f6]" />
            </DialogClose>
          </div>

          {/* 프로필 헤더 */}
          {profile && (
            <div className="flex items-center justify-between gap-2 px-6 py-1">
              <div className="flex min-w-0 items-center gap-2">
                <ArrowBackIcon className="size-8 shrink-0 text-[#f6f6f6]" />
                <ProfileAvatar src={profile.avatarUrl} alt={profile.nickname} size="small" />
                <span className="truncate text-sm font-semibold text-[#f6f6f6]">
                  {profile.nickname}
                </span>
                {profile.badgeText && (
                  <Badge variant="active" size="md" className="shrink-0">
                    {profile.badgeText}
                  </Badge>
                )}
              </div>
              {profile.homeHref && (
                <DetailLink
                  href={profile.homeHref}
                  label="브리더홈"
                  size="md"
                  className="shrink-0 text-[#f6f6f6]"
                />
              )}
            </div>
          )}

          {/* 이미지 + 네비게이션 + 설명 — 화살표는 단일 이미지여도 영역 유지, 아이콘만 숨김 */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center gap-5 px-12 py-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!hasCarousel}
              aria-label="이전 이미지"
              className={cn(
                'shrink-0 text-[#f6f6f6] transition-opacity hover:opacity-70',
                !hasCarousel && 'invisible',
              )}
            >
              <PixelArrowRightIcon className="size-12 rotate-180" />
            </button>

            <div className="relative aspect-[4/3] h-full max-w-full overflow-hidden rounded-lg bg-[#6b6b6b]">
              <Image
                src={images[currentIndex]}
                alt={`이미지 ${currentIndex + 1}`}
                fill
                className="object-cover"
              />

              {representativeIndex === currentIndex && (
                <span className="absolute top-[1.125rem] left-5 rounded-lg bg-[#3e3e3e] px-2 py-1 text-xs font-semibold text-[#f6f6f6]">
                  대표이미지
                </span>
              )}

              {description && (
                <p className="absolute inset-x-0 bottom-0 max-h-[6.625rem] overflow-y-auto bg-black/60 px-6 py-2.5 text-sm leading-[1.5] font-semibold text-[#f6f6f6]">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!hasCarousel}
              aria-label="다음 이미지"
              className={cn(
                'shrink-0 text-[#f6f6f6] transition-opacity hover:opacity-70',
                !hasCarousel && 'invisible',
              )}
            >
              <PixelArrowRightIcon className="size-12" />
            </button>
          </div>

          {/* 캐러셀 인디케이터 */}
          {hasCarousel && (
            <div className="flex items-center justify-center gap-1 p-4">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === currentIndex ? 'w-5 bg-[#fffa94]' : 'w-2 bg-[#a9835a]',
                  )}
                />
              ))}
            </div>
          )}

          {/* 하단 버튼 */}
          {footer && (
            <div className="flex items-center justify-end gap-5 px-6 py-3">{footer}</div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ImageDetailModal, type ImageDetailModalProps, type ImageDetailProfile }
