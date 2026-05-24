import type { FavoriteBreeder } from './myHome'

export interface ExploreBreeder extends FavoriteBreeder {
  isPopular: boolean
}

const BREEDER_BASE: Omit<ExploreBreeder, 'id'> = {
  nickname: '도심속 도마뱀 사장님',
  imageUrl: null,
  badges: ['브리더 뱃지', '80 BPM', '주목할 브리더'],
  isBreeding: true,
  location: '마곡동',
  date: '2026.4.30',
  isPopular: false,
}

export const MOCK_FEATURED_BREEDERS: ExploreBreeder[] = Array.from(
  { length: 3 },
  (_, i) => ({
    ...BREEDER_BASE,
    id: `featured-${i + 1}`,
    isPopular: true,
  }),
)

export const MOCK_EXPLORE_BREEDERS: ExploreBreeder[] = Array.from(
  { length: 9 },
  (_, i) => ({
    ...BREEDER_BASE,
    id: `explore-${i + 1}`,
  }),
)

export const POPULAR_KEYWORDS = [
  '강아지 관리',
  '고양이 관리',
  '개코 도마뱀 관리',
  '개코 도마뱀 관리',
  '개코 도마뱀 관리',
]
