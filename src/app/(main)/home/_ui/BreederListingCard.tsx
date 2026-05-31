'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge, ListingStats, PostedDate } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL } from '@/shared/types'

interface BreederListingCardProps {
  listing: AdoptionListingCard
  className?: string
}

const STATUS_BG: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-[#5d5d5d]',
  reserved: 'bg-[#5d5d5d]',
  completed: 'bg-[#a4a4a4]',
}

const BreederListingCard = ({ listing, className }: BreederListingCardProps) => {
  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn('flex flex-col gap-[0.438rem]', className)}
    >
      {/* Image */}
      <div className="relative size-[10.25rem] overflow-hidden rounded-[0.375rem] bg-[#d4d4d4]">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
        <Badge
          variant="status"
          className={cn(
            STATUS_BG[listing.status],
            'absolute top-[0.766rem] left-[0.625rem] px-[0.625rem] py-[0.25rem] text-xs leading-[1.375rem]',
          )}
        >
          {ADOPTION_STATUS_LABEL[listing.status]}
        </Badge>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm leading-normal font-semibold text-[#5d5d5d]">{listing.name}</p>
        <ListingStats
          inquiryCount={listing.inquiryCount}
          favoriteCount={listing.favoriteCount}
          viewCount={listing.viewCount}
          size="md"
          className="gap-[0.375rem]"
        />
        <PostedDate date={listing.postedAt} />
      </div>
    </Link>
  )
}

export { BreederListingCard }
