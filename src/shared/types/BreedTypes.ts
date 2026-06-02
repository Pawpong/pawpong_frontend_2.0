/** 품종(breed) 관련 타입 정의 */

/** 품종 조회 대상 동물 타입 */
export type BreedPetType = 'dog' | 'cat'

/** 품종 카테고리 */
export interface BreedCategory {
  category: string
  categoryDescription?: string
  breeds: string[]
}

/** 동물 타입별 품종 목록 응답 */
export interface BreedsByPetType {
  petType: BreedPetType
  categories: BreedCategory[]
}
