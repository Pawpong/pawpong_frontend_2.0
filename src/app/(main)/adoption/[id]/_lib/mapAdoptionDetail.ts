import type {
  AdoptionPetCard,
  AdoptionPetDetail,
  AdoptionDetailDto,
  HealthInfo,
  ParentInfo,
  BreedingEnvironment,
} from '@/shared/types'
import { formatDate } from '@/shared/lib/formatDate'
import { petTypeToCategory } from '@/shared/lib/petCategory'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'

/**
 * v2 입양 상세 API 응답(AdoptionPetDetail)을 상세 UI 뷰모델(AdoptionDetailDto)로 매핑한다.
 * - 검사 기록은 UI의 단일 검사 정보(GeneticTestInfo)로 축약
 * - 브리더의 다른 분양건(otherListings)은 목록 API를 따로 조회해 넘긴다 (상세 응답에 없음)
 */
export const mapAdoptionDetail = (
  d: AdoptionPetDetail,
  otherPets: AdoptionPetCard[] = [],
): AdoptionDetailDto => {
  const health: HealthInfo = {
    vaccinationCompleted: d.vaccinationStatus === 'completed',
    vaccinations: (d.vaccinationRecords ?? []).map((r) => ({
      name: r.name,
      date: r.date,
      dose: `${r.round}차`,
    })),
    // 미완료 사유는 분양글 작성 시 브리더가 입력 — 기록이 없을 때 안내 문구 대신 노출
    vaccinationIncompleteReason: d.vaccinationIncompleteReason,
    geneticTestCompleted: d.geneticTestStatus === 'completed',
    geneticTestIncompleteReason: d.geneticTestIncompleteReason,
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
    status: d.status,
    price: `${d.price.toLocaleString('ko-KR')}원`,
    birthDate: formatDate(d.birthDate),
    gender: d.gender,
    description: d.description,
    tags: d.tags ?? [],
    imageUrls,
    category: petTypeToCategory(d.petType),
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
    otherListings: otherPets.map(mapAdoptionCard),
  }
}
