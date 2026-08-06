import type { AnimalCategory, CommunityPetType } from '@/shared/types'

/**
 * 탐색 카테고리 칩(AnimalCategory) → 백엔드 petType(CommunityPetType) 매핑.
 * 'all'은 필터 없음(undefined), 도마뱀(lizard)은 백엔드 enum 기준 reptile.
 */
export const CATEGORY_TO_PET_TYPE: Record<AnimalCategory, CommunityPetType | undefined> = {
  all: undefined,
  dog: 'dog',
  cat: 'cat',
  lizard: 'reptile',
}

/** 백엔드 petType → 탐색 카테고리 역매핑 */
const PET_TYPE_TO_CATEGORY: Record<string, AnimalCategory> = {
  dog: 'dog',
  cat: 'cat',
  reptile: 'lizard',
}

/** 백엔드 petType → 탐색 카테고리 (petType 미보유 문서·미지원 값은 'all') */
export const petTypeToCategory = (petType?: string): AnimalCategory =>
  (petType && PET_TYPE_TO_CATEGORY[petType]) || 'all'
