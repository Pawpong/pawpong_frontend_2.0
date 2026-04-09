/**
 * 홈 화면 관련 타입 정의
 * 출처: home.ts, home-animal.types.ts
 *
 */

/** 배너 DTO */
export interface BannerDto {
  bannerId: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  desktopImageFileName: string;
  mobileImageFileName: string;
  linkType: 'internal' | 'external';
  linkUrl: string;
  title?: string;
  description?: string;
  order: number;
  targetAudience?: ('guest' | 'adopter' | 'breeder')[];
}

/** FAQ DTO */
export interface FaqDto {
  faqId: string;
  question: string;
  answer: string;
  category: string;
  userType: 'adopter' | 'breeder';
  order: number;
}

/** 분양중인 아이들 응답 DTO (서버 응답) */
export interface AvailablePetDto {
  petId: string;
  name: string;
  breed: string;
  breederId: string;
  breederName: string;
  price: number | null;
  mainPhoto: string;
  birthDate: string | null;
  ageInMonths: number;
  location: {
    city: string;
    district: string;
  };
  isAd?: boolean;
}

/** 홈 화면 동물 카드 (프론트엔드 표시용)
 * @출처 - home-animal.types.ts의 HomeAnimalData
 */
export interface HomeAnimalData {
  id: string;
  breederId: string;
  avatarUrl: string;
  name: string;
  sex: 'male' | 'female';
  birth: string;
  price: string | null;
  breed: string;
  status: 'available' | 'reserved' | 'completed';
  isAd?: boolean;
}
