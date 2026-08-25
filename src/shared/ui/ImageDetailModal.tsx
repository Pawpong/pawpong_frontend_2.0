'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from '@/shared/ui'
import { ArrowBackIcon, CloseIcon, PixelArrowRightIcon, VoteIcon } from '@/shared/assets'
import { useImageCarousel } from '@/shared/lib/useImageCarousel'
import { cn } from '@/shared/lib/cn'
import { Badge } from './Badge'
import { DetailLink } from './DetailLink'
import { ProfileAvatar } from './ProfileAvatar'

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
  /** @deprecated showVoteStatus를 사용해주세요. */
  voted?: boolean
  /** "이미지에 투표하였습니다." 문구 노출 여부 */
  showVoteStatus?: boolean
  onVote?: (index: number) => void
  /** 대표이미지 뱃지를 붙일 인덱스 */
  representativeIndex?: number
  /** 이미지 하단 설명 */
  description?: string
  /** 하단 버튼 영역 (다음/버튼 등 컨텍스트마다 다름) */
  footer?: ReactNode
  /** footer 버튼 영역 노출 여부 */
  showActions?: boolean
  className?: string
}

interface CarouselIndicatorProps {
  count: number
  currentIndex: number
}

const CarouselIndicator = ({ count, currentIndex }: CarouselIndicatorProps) => (
  <div className="flex shrink-0 items-center justify-center gap-1 px-4 py-1">
    {Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className={cn(
          'h-2 rounded-lg transition-[width,background-color]',
          // 히어로 캐러셀과 동일한 노란 pill (#fffa94 활성 / #a9835a 비활성)
          index === currentIndex ? 'w-5 bg-[#fffa94]' : 'w-2 bg-[#a9835a]',
        )}
      />
    ))}
  </div>
)

const ImageDetailModal = ({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  profile,
  voteCount,
  voted,
  showVoteStatus = voted ?? false,
  onVote,
  representativeIndex,
  description,
  footer,
  showActions = true,
  className,
}: ImageDetailModalProps) => {
  const { currentIndex, handlePrev, handleNext } = useImageCarousel(images, initialIndex)
  const hasCarousel = images.length > 1
  const hasActions = showActions && Boolean(footer)
  // 프로필/설명/투표/버튼이 전혀 없는 순수 이미지 뷰(입양 상세) — 박스를 이미지 폭에 맞춰
  // 좌우 여백/멀어진 화살표로 불규칙해 보이던 문제를 제거 (Figma 1952-260350)
  const isPlain =
    !profile && !description && !hasActions && voteCount === undefined && !showVoteStatus

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'fixed top-1/2 left-1/2 z-modal flex h-[min(45.625rem,100dvh)] w-[min(23.4375rem,100vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-hidden bg-neutral-0 py-5 shadow-[0_7px_7px_rgba(55,55,55,0.1)]',
            'tab:h-auto tab:max-h-[calc(100dvh-2rem)] tab:w-[48rem]',
            'pc:h-[40.875rem] pc:w-[64.125rem] pc:rounded-[1.25rem] pc:py-0',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">이미지 상세 보기</DialogPrimitive.Title>

          <div className="flex min-h-0 w-full flex-1 flex-col gap-2 tab:flex-none tab:gap-0 pc:flex-1">
            {/* 투표 정보 + 닫기 */}
            <div className="flex h-[3.25rem] shrink-0 items-center gap-5 px-4 py-3 tab:px-12 pc:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-8 text-neutral-50 tab:gap-8">
                {showVoteStatus && (
                  <span className="flex min-w-0 items-center gap-0.5 text-base leading-[1.5] font-semibold">
                    <VoteIcon className="size-6 shrink-0" />
                    <span className="truncate">이미지에 투표하였습니다.</span>
                  </span>
                )}
                {voteCount !== undefined && (
                  <button
                    type="button"
                    onClick={() => onVote?.(currentIndex)}
                    disabled={!onVote}
                    className="flex shrink-0 items-center gap-0.5 text-base leading-[1.5] font-semibold disabled:cursor-default"
                  >
                    <VoteIcon className="size-6" />
                    {voteCount}
                  </button>
                )}
              </div>
              <DialogClose className="shrink-0 cursor-pointer text-neutral-50" aria-label="닫기">
                <CloseIcon className="size-6" />
              </DialogClose>
            </div>

            {/* 프로필 헤더 */}
            {profile && (
              <div className="flex h-10 shrink-0 items-center justify-between gap-2 px-4 py-1 tab:px-12 pc:px-20">
                <div className="flex min-w-0 items-center gap-2">
                  <ArrowBackIcon className="size-8 shrink-0 text-neutral-50" />
                  <ProfileAvatar
                    src={profile.avatarUrl}
                    alt={profile.nickname}
                    size="small"
                    className="bg-neutral-100"
                  />
                  <span className="max-w-[9rem] truncate text-sm leading-[1.5] font-semibold text-neutral-50 tab:max-w-[21.625rem]">
                    {profile.nickname}
                  </span>
                  {profile.badgeText && (
                    <Badge
                      variant="active"
                      size="md"
                      className="h-6 shrink-0 border-0 bg-primary-500 text-[0.625rem] text-white"
                    >
                      {profile.badgeText}
                    </Badge>
                  )}
                </div>
                {profile.homeHref && (
                  <DetailLink
                    href={profile.homeHref}
                    label="브리더홈"
                    size="md"
                    className="shrink-0 text-neutral-50"
                  />
                )}
              </div>
            )}

            {/* 이미지 + 좌우 네비게이션 */}
            <div className="relative flex min-h-0 w-full flex-1 shrink-0 items-center justify-center tab:h-[28.40625rem] tab:flex-none pc:h-auto pc:flex-1">
              <div
                className={cn(
                  'relative size-full max-w-[37.875rem] overflow-hidden bg-neutral-700 tab:rounded-lg pc:aspect-[4/3] pc:h-full pc:w-auto',
                  // 순수 이미지 뷰(입양 상세)는 pc에서 폭 캡을 풀어 높이 기준 4/3 가로형으로 (Figma 1952-260350)
                  isPlain && 'pc:max-w-[48.75rem] pc:rounded-[1.25rem]',
                )}
              >
                {images[currentIndex] && (
                  <Image
                    src={images[currentIndex]}
                    alt={`이미지 ${currentIndex + 1}`}
                    fill
                    priority
                    sizes="(min-width: 1440px) 606px, (min-width: 768px) 606px, 375px"
                    className="object-cover"
                  />
                )}

                {representativeIndex === currentIndex && (
                  <span className="absolute top-[1.125rem] left-5 rounded-lg bg-neutral-850 px-2 py-1 text-xs leading-[1.5] font-semibold text-neutral-50 pc:p-2 pc:text-sm">
                    대표이미지
                  </span>
                )}
              </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-full items-center justify-between px-12 tab:flex pc:px-12">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasCarousel}
                  aria-label="이전 이미지"
                  className={cn(
                    'pointer-events-auto shrink-0 cursor-pointer text-neutral-50 transition-opacity hover:opacity-70',
                    !hasCarousel && 'invisible',
                  )}
                >
                  <PixelArrowRightIcon className="size-8 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasCarousel}
                  aria-label="다음 이미지"
                  className={cn(
                    'pointer-events-auto shrink-0 cursor-pointer text-neutral-50 transition-opacity hover:opacity-70',
                    !hasCarousel && 'invisible',
                  )}
                >
                  <PixelArrowRightIcon className="size-8" />
                </button>
              </div>
            </div>

            {/* 순수 이미지 뷰(입양)는 히어로처럼 1장이어도 인디케이터를 사진 밑에 노출 */}
            {(hasCarousel || isPlain) && (
              <CarouselIndicator count={images.length} currentIndex={currentIndex} />
            )}

            {/* 하단 버튼 — showActions로 독립 제어 */}
            {hasActions && (
              <div className="flex h-20 shrink-0 items-center justify-center px-4 py-4 tab:h-[5.875rem] tab:justify-end tab:gap-5 tab:px-12 tab:py-3 pc:px-20">
                <div aria-hidden className="hidden h-[4.375rem] min-w-0 flex-1 tab:block" />
                <div className="flex w-full max-w-[18.5625rem] items-center gap-2.5 tab:w-[22.5rem] tab:max-w-none tab:gap-5 [&>*]:min-w-0 [&>*]:flex-1">
                  {footer}
                </div>
              </div>
            )}

            {/* 모바일/태블릿 설명 */}
            {description && (
              <div className="flex min-h-0 flex-1 shrink-0 bg-black/60 px-4 py-2.5 tab:h-[6.625rem] tab:flex-none tab:px-12 pc:hidden">
                <p className="overflow-y-auto text-sm leading-[1.5] font-semibold text-neutral-50">
                  {description}
                </p>
              </div>
            )}
          </div>

          {/* PC 설명은 Figma처럼 하단 버튼 영역 위에 오버레이 */}
          {description && (
            <div className="absolute right-0 bottom-0 left-0 hidden h-[6.625rem] bg-black/60 px-[14.6875rem] py-2.5 pc:flex pc:flex-col pc:items-center">
              <p className="w-full max-w-[36.5rem] overflow-y-auto text-sm leading-[1.5] font-semibold text-neutral-50">
                {description}
              </p>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

export { ImageDetailModal, type ImageDetailModalProps, type ImageDetailProfile }
