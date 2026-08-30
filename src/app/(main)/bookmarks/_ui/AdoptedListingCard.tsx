'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Badge, Button, CtaModal, ListingStats } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { AdoptedListingCard as AdoptedListingCardType } from '@/shared/types'
import { GENDER_LABEL } from '@/shared/types'
import { AdoptionStatusBadge } from '@/entities/adoption'

interface AdoptedListingCardProps {
  listing: AdoptedListingCardType
}

// [refactored] 이미지 + 완료 디밍 오버레이 + 인기 배지 — 모바일/PC 공통 (size·rounded·배지위치만 className으로 차이)
const CardImage = ({
  listing,
  isCompleted,
  className,
  badgeClassName,
}: {
  listing: AdoptedListingCardType
  isCompleted: boolean
  className?: string
  badgeClassName?: string
}) => (
  <div className={cn('relative shrink-0 overflow-hidden bg-neutral-700', className)}>
    <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
    {isCompleted && <div className="absolute inset-0 bg-white/70" />}
    {listing.isPopular && (
      <Badge variant="outline" className={cn('absolute', badgeClassName)}>
        인기
      </Badge>
    )}
  </div>
)

// [refactored] listing의 문의/관심/조회 카운트를 넘기는 ListingStats 래퍼 (prop 스프레드 반복 제거)
const CardStats = ({
  listing,
  size,
  className,
}: {
  listing: AdoptedListingCardType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => (
  <ListingStats
    inquiryCount={listing.inquiryCount}
    favoriteCount={listing.favoriteCount}
    viewCount={listing.viewCount}
    size={size}
    className={className}
  />
)

const AdoptedListingCard = ({ listing }: AdoptedListingCardProps) => {
  const router = useRouter()
  const isCompleted = listing.status === 'adopted'
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {/* 모바일·탭 카드 (Figma 975-15983 · Card2 medium) — 클릭 시 CTA 모달(상세/채팅 선택)
          bg #f6f6f6, 이미지 110, 제목+상태배지/stats (목록은 하트 없음)
          카드 max-w 600 중앙정렬 (탭에서 좌우 ≈36px 여백, 모바일은 full) */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mx-auto flex w-full max-w-[37.5rem] items-center gap-4 rounded-lg bg-neutral-50 p-2 text-left pc:hidden"
      >
        {/* [refactored] CardImage — 110×110 rounded-4 */}
        <CardImage
          listing={listing}
          isCompleted={isCompleted}
          className="size-[6.875rem] rounded"
          badgeClassName="top-2 left-2.5"
        />

        {/* 정보: 상단(제목 1줄 + 상태배지) · 하단(stats) — 위/아래 분배, 상하 5px 여백 */}
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch overflow-hidden py-[0.3125rem]">
          <div className="flex w-full flex-col items-start gap-1">
            <p className="w-full truncate text-base leading-[1.5] font-bold text-neutral-850">
              {listing.name}
            </p>
            <AdoptionStatusBadge status={listing.status} size="md" />
          </div>
          {/* [refactored] CardStats */}
          <CardStats listing={listing} size="sm" className="w-full text-xs text-neutral-700" />
        </div>
      </button>

      {/* PC 카드 (Figma 797-87156 · Card2 large) — pc 전용. bg #f6f6f6, 이미지 280×210, 제목+상태배지/설명 3줄, stats + 대화중인 채팅
          카드 고정폭 920px 중앙정렬 (콘텐츠 폭이 더 넓으면 좌우 여백) */}
      <div className="mx-auto hidden w-full max-w-[57.5rem] gap-7 rounded-lg bg-neutral-50 px-5 py-3 pc:flex pc:items-center">
        {/* [refactored] CardImage — 280×210 rounded-8 */}
        <CardImage
          listing={listing}
          isCompleted={isCompleted}
          className="h-[13.125rem] w-[17.5rem] rounded-lg"
          badgeClassName="top-[0.875rem] left-4"
        />

        {/* 정보: 상단(제목·배지/설명) · 하단(stats + 버튼) */}
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <p className="truncate text-xl leading-[1.5] font-bold text-neutral-850">
                {`${listing.name} | ${GENDER_LABEL[listing.gender]} ${listing.birthDateText}`}
              </p>
              <AdoptionStatusBadge status={listing.status} className="shrink-0" />
            </div>
            {listing.description && (
              <p className="line-clamp-3 text-base leading-[1.5] font-semibold text-neutral-850">
                {listing.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* [refactored] CardStats */}
            <CardStats
              listing={listing}
              className="flex-1 text-sm leading-[1.5] text-neutral-700"
            />
            <Button
              variant="primary"
              onClick={() => router.push('/chat')}
              className="h-10 w-[11.4375rem] shrink-0 text-base"
            >
              대화중인 채팅
            </Button>
          </div>
        </div>
      </div>

      {/* 카드(tab~mobile) 클릭 시 — 입양 상세 / 대화중인 채팅 선택 (Figma 2151-193965) */}
      <CtaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="분양 완료 된 건입니다."
        icon={null}
        actions={[
          {
            label: '입양 상세 보기',
            variant: 'fill',
            onClick: () => router.push(`/adoption/${listing.listingId}`),
          },
          { label: '대화중인채팅', variant: 'outline', onClick: () => router.push('/chat') },
        ]}
      />
    </>
  )
}

export { AdoptedListingCard }
