/** 인기 검색어 관련 타입 정의 */

/** 인기 검색어 */
export interface PopularKeyword {
  keywordId: string
  keyword: string
  rank: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
