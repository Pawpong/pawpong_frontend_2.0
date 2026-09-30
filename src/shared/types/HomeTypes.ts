/**
 * 홈 화면 관련 타입 정의
 * 출처: home.ts, home-animal.types.ts
 *
 */

/** 배너 DTO */
export interface BannerDto {
  bannerId: string
  desktopImageUrl: string
  mobileImageUrl: string
  desktopImageFileName: string
  mobileImageFileName: string
  linkType: 'internal' | 'external'
  linkUrl: string
  title?: string
  description?: string
  order: number
  isActive: boolean
  targetAudience?: ('guest' | 'adopter' | 'breeder')[]
}

/** FAQ 카테고리 */
export type FaqCategory = 'service' | 'adoption' | 'breeder' | 'payment' | 'etc'

/** FAQ 사용자 타입 */
export type FaqUserType = 'adopter' | 'breeder' | 'both'

/** FAQ DTO */
export interface FaqDto {
  faqId: string
  question: string
  answer: string
  category: FaqCategory
  userType: FaqUserType
  order: number
}

/** 분양중인 아이들 응답 DTO (서버 응답) */
export interface AvailablePetDto {
  petId: string
  name: string
  breed: string
  breederId: string
  breederName: string
  price: number | null
  mainPhoto: string
  birthDate: string | null
  ageInMonths: number
  location: {
    city: string
    district: string
  }
  isAd?: boolean
}
