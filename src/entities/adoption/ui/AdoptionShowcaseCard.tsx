'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GenderIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL } from '@/shared/types'
import { Badge, FavoriteToggle } from '@/shared/ui'

const STATUS_BADGE_CLASS: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-[#406dff] text-white',
  reserved: 'bg-[#406dff] text-white',
  completed: 'bg-[#e4e4e4] text-[#b8b8b8]',
}

interface AdoptionShowcaseCardProps {
  listing: AdoptionListingCard
  className?: string
  isFavorite?: boolean
  onToggle?: () => void
}

/** 홈 분양 쇼케이스용 프레젠테이셔널 카드. 즐겨찾기 연결은 features 래퍼가 담당한다. */
const AdoptionShowcaseCard = ({
  listing,
  className,
  isFavorite,
  onToggle,
}: AdoptionShowcaseCardProps) => (
  <Link
    href={`/adoption/${listing.listingId}`}
    className={cn('flex w-[10.25rem] flex-col pc:w-auto', className)}
  >
    <div className="relative h-[8.3649rem] w-[10.25rem] overflow-hidden rounded bg-[#6b6b6b] pc:aspect-[348/284] pc:h-auto pc:w-full pc:rounded-[0.5rem]">
      <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
      {listing.isPopular && (
        <Badge
          variant="outline"
          className="absolute top-[0.5rem] left-[0.75rem] hidden border-[#406dff] bg-white px-2 py-1 text-sm font-semibold text-[#406dff] pc:flex"
        >
          🔥인기
        </Badge>
      )}
      <div className="absolute top-0 left-0 flex items-center gap-1 px-2 py-1 pc:hidden">
        <Badge className={`h-6 px-2 py-0 text-[0.625rem] ${STATUS_BADGE_CLASS[listing.status]}`}>
          {listing.status === 'completed' ? '분양완료' : '분양중'}
        </Badge>
        {listing.isPopular && (
          <Badge
            variant="outline"
            className="h-6 border-[#406dff] bg-white px-2 py-0 text-[0.625rem] font-semibold text-[#406dff]"
          >
            인기
          </Badge>
        )}
      </div>
      <FavoriteToggle
        isFavorite={isFavorite}
        onToggle={onToggle}
        className="absolute right-[0.5rem] bottom-[0.25rem]"
        iconClassName="size-8 pc:size-12"
      />
    </div>

    <div className="flex items-start justify-between gap-[0.5rem] p-2 pc:p-[0.75rem]">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center">
          <p className="truncate text-sm leading-[1.5] font-semibold text-[#3e3e3e] pc:text-base">
            {listing.name}
          </p>
          <GenderIcon
            gender={listing.gender}
            className="size-5 shrink-0 text-[#3e3e3e] pc:size-6"
          />
        </div>
        <p className="truncate text-xs leading-[1.5] font-medium text-[#3e3e3e] pc:text-sm">
          {listing.ageText}
        </p>
      </div>
      <Badge
        className={`hidden h-[1.8125rem] shrink-0 px-2 py-1 text-sm pc:flex ${STATUS_BADGE_CLASS[listing.status]}`}
      >
        {ADOPTION_STATUS_LABEL[listing.status]}
      </Badge>
    </div>
  </Link>
)

export { AdoptionShowcaseCard }
export type { AdoptionShowcaseCardProps }
