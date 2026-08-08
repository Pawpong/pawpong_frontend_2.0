import type { AdoptionListingCard, AdoptedListingCard } from '@/shared/types'

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
  description:
    '경상남도 창원에 위치한 랙돌 캐터리 로지데이즈입니다.\n저희 캐터리는 평균 생후 4개월령에 중성화 수술을 완료한 후 입양을 진행하고 있으며,...',
  chatCount: 2,
}

/** 탐색 페이지용 목데이터 생성 */
export const createMockListings = (): AdoptionListingCard[] => {
  const items: { status: AdoptionListingCard['status']; postedAt: string }[] = [
    { status: 'available', postedAt: '2026.4.30' },
    { status: 'available', postedAt: '2026.4.30' },
    { status: 'available', postedAt: '2026.4.30' },
    { status: 'adopted', postedAt: '2026.4.30' },
    { status: 'adopted', postedAt: '2026.4.30' },
    { status: 'adopted', postedAt: '2026.4.29' },
    { status: 'adopted', postedAt: '2026.4.28' },
    { status: 'reserved', postedAt: '2026.4.30' },
    { status: 'reserved', postedAt: '2026.4.30' },
    { status: 'reserved', postedAt: '2026.4.29' },
    { status: 'reserved', postedAt: '2026.4.29' },
    { status: 'available', postedAt: '2026.4.29' },
    { status: 'available', postedAt: '2026.4.29' },
    { status: 'available', postedAt: '2026.4.28' },
  ]

  return items.map((item, i) => ({
    ...MOCK_ADOPTION_LISTING,
    listingId: String(i + 1),
    status: item.status,
    postedAt: item.postedAt,
    isPopular: i < 4,
  }))
}

/** 내가 입양한 목록 목데이터 */
export const MOCK_ADOPTED_LISTINGS: AdoptedListingCard[] = [
  {
    ...MOCK_ADOPTION_LISTING,
    listingId: 'adopted-1',
    status: 'adopted',
    adoptedAt: '2026.04.30',
    isPopular: false,
  },
  {
    ...MOCK_ADOPTION_LISTING,
    listingId: 'adopted-2',
    status: 'adopted',
    adoptedAt: '2026.05.05',
    isPopular: true,
  },
]
