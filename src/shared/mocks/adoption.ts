import type { AdoptionListingCard } from '@/shared/types'

export const MOCK_ADOPTION_LISTING: AdoptionListingCard = {
  listingId: '1',
  name: '레오파드 개코도마뱀 (만다린)',
  gender: 'female',
  ageText: '6개월',
  thumbnailUrl: '/images/mock-pet.jpg',
  status: 'available',
  category: 'lizard',
  inquiryCount: 1,
  favoriteCount: 10,
  viewCount: 20,
  isFavorited: false,
  isPopular: true,
  postedAt: '2026.4.30',
}

/** 탐색 페이지용 목데이터 생성 */
export const createMockListings = (): AdoptionListingCard[] => {
  const statuses: AdoptionListingCard['status'][] = [
    'available',
    'available',
    'available',
    'completed',
    'reserved',
    'available',
    'available',
    'available',
    'available',
  ]

  return statuses.map((status, i) => ({
    ...MOCK_ADOPTION_LISTING,
    listingId: String(i + 1),
    status,
    isPopular: i < 3,
  }))
}
