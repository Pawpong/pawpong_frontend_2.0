'use client'

import Image from 'next/image'
import { Badge, FavoriteButton, ListingStats } from '@/shared/ui'
import { ShareIcon } from '@/shared/assets/icons'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { AdoptionCardHorizontal } from '@/entities/adoption'
import { useToggleAdoptionFavorite } from '@/features/adoption'
import type { AdoptionListingCard } from '@/shared/types'

const OtherListingCard = ({ listing }: { listing: AdoptionListingCard }) => {
  // 모바일/데스크탑 변형이 같은 관심 상태를 공유하도록 부모에서 토글 훅 호출
  const { isFavorite, toggleFavorite } = useToggleAdoptionFavorite(
    listing.listingId,
    listing.isFavorited,
  )

  return (
    <>
      {/* 모바일: 가로형 카드 */}
      <div className="tab:hidden">
        <AdoptionCardHorizontal
          listing={listing}
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
        />
      </div>
      {/* 데스크탑: 가로형 큰 카드 */}
      <div className="hidden tab:block">
        <DesktopOtherListingCard
          listing={listing}
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
        />
      </div>
    </>
  )
}

const DesktopOtherListingCard = ({
  listing,
  isFavorite,
  onToggle,
}: {
  listing: AdoptionListingCard
  isFavorite: boolean
  onToggle: () => void
}) => (
  <div className="flex overflow-hidden rounded-[1rem] bg-[#e7e7e7]">
    <div className="relative h-[21.75rem] w-[20.1875rem] shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]">
      <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
    </div>
    <div className="flex flex-1 flex-col px-[1.5rem] py-[1.5rem]">
      {listing.isPopular && (
        <Badge
          variant="status"
          className="mb-[0.5rem] w-fit px-[0.585rem] py-[0.234rem] text-[0.819rem] leading-[1.286rem]"
        >
          {ADOPTION_STATUS_LABEL[listing.status]}
        </Badge>
      )}
      <div className="flex items-center gap-[1.125rem]">
        <p className="text-[1.25rem] leading-[1.375rem] font-semibold text-[#5d5d5d]">
          {listing.name}
        </p>
        <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
        <span className="text-[1.25rem] leading-[1.375rem] font-semibold text-[#5d5d5d]">
          {GENDER_LABEL[listing.gender]}
        </span>
        <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
        <span className="text-[1.25rem] leading-[1.375rem] font-semibold text-[#5d5d5d]">
          {listing.ageText}
        </span>
      </div>
      <ListingStats
        inquiryCount={listing.inquiryCount}
        favoriteCount={listing.favoriteCount}
        viewCount={listing.viewCount}
        size="lg"
        className="mt-auto justify-end"
      />
      <div className="mt-[0.5rem] flex items-center justify-end gap-[0.625rem]">
        <FavoriteButton size="lg" isFavorite={isFavorite} onToggle={onToggle} />
        <button
          type="button"
          className="flex items-center gap-[0.625rem] rounded-full p-[0.625rem] text-[0.875rem] font-medium text-[#5d5d5d]"
        >
          <ShareIcon className="size-[1.5rem]" />
          <span>공유</span>
        </button>
      </div>
    </div>
  </div>
)

export { OtherListingCard }
