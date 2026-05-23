'use client'

import { useMemo, useState } from 'react'
import type { AdoptionStatus, AdoptionListingCard } from '@/shared/types'

const useListingsFilter = (allListings: AdoptionListingCard[]) => {
  const [activeStatus, setActiveStatus] = useState<AdoptionStatus | null>('available')

  const filteredListings = activeStatus
    ? allListings.filter((l) => l.status === activeStatus)
    : allListings

  const isGroupedView = activeStatus === 'reserved' || activeStatus === 'completed'

  const groupedByDate = useMemo(() => {
    if (!isGroupedView) return null
    const groups = new Map<string, AdoptionListingCard[]>()
    for (const listing of filteredListings) {
      const date = listing.postedAt
      const existing = groups.get(date) ?? []
      existing.push(listing)
      groups.set(date, existing)
    }
    return groups
  }, [filteredListings, isGroupedView])

  return {
    activeStatus,
    setActiveStatus,
    filteredListings,
    isGroupedView,
    groupedByDate,
  }
}

export { useListingsFilter }
