/** 지역(district) 관련 타입 정의 */

/** 시/도 + 하위 지역 목록 */
export interface District {
  city: string
  districts: string[]
}
