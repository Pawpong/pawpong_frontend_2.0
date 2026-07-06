import type {
  AdoptionPetDetail,
  AdoptionDetailDto,
  AnimalCategory,
  AdoptionStatus,
  HealthInfo,
  ParentInfo,
  BreedingEnvironment,
} from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'

/** 백엔드 종류(petType) → 탐색 카테고리 매핑 */
const PET_TYPE_TO_CATEGORY: Record<string, AnimalCategory> = {
  dog: 'dog',
  cat: 'cat',
  reptile: 'lizard',
}

/** 백엔드 PetStatus('adopted') → 프론트 AdoptionStatus('completed') */
const toAdoptionStatus = (status: AdoptionPetDetail['status']): AdoptionStatus =>
  status === 'adopted' ? 'completed' : status

/**
 * v2 입양 상세 API 응답(AdoptionPetDetail)을 상세 UI 뷰모델(AdoptionDetailDto)로 매핑한다.
 * - 검사 기록은 UI의 단일 검사 정보(GeneticTestInfo)로 축약
 * - 브리더의 다른 분양건(otherListings)은 이번 MVP 에서 빈 배열 (별도 조회 필요)
 */
export const mapAdoptionDetail = (d: AdoptionPetDetail): AdoptionDetailDto => {
  const health: HealthInfo = {
    vaccinationCompleted: d.vaccinationStatus === 'completed',
    vaccinations: (d.vaccinationRecords ?? []).map((r) => ({
      name: r.name,
      date: r.date,
      dose: `${r.round}차`,
    })),
    geneticTestCompleted: d.geneticTestStatus === 'completed',
    geneticTest: {
      date: d.geneticTestRecords?.[0]?.date ?? '',
      institution: d.geneticTestRecords?.[0]?.institution ?? '',
      results: (d.geneticTestRecords ?? []).map((r) => ({
        disease: r.testName,
        result: r.result,
      })),
    },
  }

  const parents: ParentInfo[] = (d.parents ?? []).map((p) => ({
    role: p.relation === 'father' ? '아빠' : '엄마',
    name: p.name,
    imageUrl: p.photoUrl,
    birthDate: formatDate(p.birthDate),
  }))

  const breedingEnvironment: BreedingEnvironment = {
    description: d.breedingEnvironment?.description ?? '',
    imageUrls: d.breedingEnvironment?.photoUrl ? [d.breedingEnvironment.photoUrl] : [],
  }

  const imageUrls =
    d.photoUrls && d.photoUrls.length > 0
      ? d.photoUrls
      : [d.primaryPhotoUrl].filter((url): url is string => Boolean(url))

  return {
    listingId: d.petId,
    name: d.name,
    status: toAdoptionStatus(d.status),
    price: `${d.price.toLocaleString('ko-KR')}원`,
    birthDate: formatDate(d.birthDate),
    gender: d.gender,
    description: d.description,
    tags: d.tags ?? [],
    imageUrls,
    category: (d.petType && PET_TYPE_TO_CATEGORY[d.petType]) || 'all',
    inquiryCount: d.inquiryCount,
    favoriteCount: d.favoriteCount,
    viewCount: d.viewCount,
    chatCount: 0,
    isFavorited: d.isFavorited,
    isPopular: d.isPopular,
    breeder: {
      id: d.breeder.breederId,
      nickname: d.breeder.displayName,
      location: d.breeder.locationText,
      bpm: d.breeder.bpm,
      profileImageUrl: d.breeder.profileImageUrl,
    },
    health,
    parents,
    breedingEnvironment,
    otherListings: [],
  }
}
