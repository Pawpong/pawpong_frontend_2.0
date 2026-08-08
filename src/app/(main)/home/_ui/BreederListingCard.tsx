'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ListingStats, PostedDate } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { AdoptionStatusBadge } from '@/entities/adoption'

interface BreederListingCardProps {
  listing: AdoptionListingCard
  className?: string
}

const BreederListingCard = ({ listing, className }: BreederListingCardProps) => {
  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn('flex flex-col gap-[0.438rem]', className)}
    >
      {/* Image */}
      <div className="relative size-[10.25rem] overflow-hidden rounded-[0.375rem] bg-[#d4d4d4]">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
        <AdoptionStatusBadge
          status={listing.status}
          size="md"
          className="absolute top-[0.766rem] left-[0.625rem] px-[0.625rem] py-[0.25rem] text-xs leading-[1.375rem]"
        />
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
