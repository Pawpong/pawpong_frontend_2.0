import type { AdoptionListingCard, AdoptionDetailDto } from '@/shared/types'

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

/** 입양 상세 페이지용 목데이터 */
export const MOCK_ADOPTION_DETAIL: AdoptionDetailDto = {
  listingId: '1',
  name: '레오파드 개코도마뱀 (만다린)',
  status: 'available',
  price: '20,0000',
  birthDate: '2025년 6월 20일',
  gender: 'female',
  description:
    '경상남도 창원에 위치한 랙돌 캐터리 로지데이즈입니다.\n\n저희 캐터리는 평균 생후 4개월령에 중성화 수술을 완료한 후 입양을 진행하고 있으며, 3마리 이상의 다묘 가정에는 입양을 진행하지 않습니다.\n\n충분한 고민 끝에 저희와 같은 기준과 방향을 공유하실 분과의 소중한 인연을 기다리고 있습니다.',
  tags: ['#개코 도마뱀', '#만다린', '#파충츄'],
  imageUrls: [
    '/images/mock-pet.jpg',
    '/images/mock-pet.jpg',
    '/images/mock-pet.jpg',
    '/images/mock-pet.jpg',
  ],
  category: 'lizard',
  inquiryCount: 1,
  favoriteCount: 10,
  viewCount: 20,
  isFavorited: false,
  isPopular: false,
  breeder: {
    id: 'breeder-1',
    nickname: '도심속 도마뱀 사장님',
    location: '독산동',
    bpm: 80,
    profileImageUrl: '/images/mock-pet.jpg',
  },
  health: {
    vaccinationCompleted: true,
    vaccinations: [
      { name: '종합백신(DHPPL)', date: '2025년 12월 8일', dose: '5차' },
      { name: '종합백신(DHPPL)', date: '2025년 12월 8일', dose: '4차' },
      { name: '광견병 백신', date: '2026년 1월 15일', dose: '3차' },
      { name: '보르데텔라 백신', date: '2026년 2월 20일', dose: '2차' },
      { name: '보르데텔라 백신', date: '2026년 2월 20일', dose: '1차' },
    ],
    geneticTestCompleted: true,
    geneticTest: {
      date: '2025년 12월 8일',
      institution: '홀리유전자',
      results: [
        { disease: '고요산뇨증', result: '정상' },
        { disease: '슬개골 탈구', result: '정상' },
      ],
    },
  },
  parents: [
    {
      role: '엄마',
      name: '레오파드개코 (만다린)',
      imageUrl: '/images/mock-pet.jpg',
      birthDate: '2020년 12월 8일생',
    },
    {
      role: '아빠',
      name: '레오파드개코 (만다린)',
      imageUrl: '/images/mock-pet.jpg',
      birthDate: '2020년 12월 8일생',
    },
  ],
  breedingEnvironment: {
    description:
      '넓은 들판이 반겨주는 조용한 곳입니다.넓은 들판이 반겨주는 조용한 곳입니다.',
    imageUrls: [
      '/images/mock-pet.jpg',
      '/images/mock-pet.jpg',
      '/images/mock-pet.jpg',
      '/images/mock-pet.jpg',
    ],
  },
  otherListings: createMockListings().slice(0, 3),
}
