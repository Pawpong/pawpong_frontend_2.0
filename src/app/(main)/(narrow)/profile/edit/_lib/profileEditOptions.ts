import type { AuthProvider, BreederPetType } from '@/shared/types'

export const NAME_MAX_LENGTH = 30
/** 서버 UpdateMyProfileRequestDto.bio maxLength */
export const BIO_MAX_LENGTH = 200
/** 서버 BreederProfileUpdateRequestDto.profileDescription maxLength */
export const LONG_DESCRIPTION_MAX_LENGTH = 1500
/** 서버 BreederProfileUpdateRequestDto.breeds — 최대 5개 */
export const BREEDS_MAX_COUNT = 5

export const PET_TYPE_LABEL: Record<BreederPetType, string> = {
  dog: '강아지',
  cat: '고양이',
  reptile: '파충류',
}

export const AUTH_PROVIDER_LABEL: Record<AuthProvider, string> = {
  local: '이메일',
  google: '구글',
  kakao: '카카오',
  naver: '네이버',
  apple: '애플',
}
