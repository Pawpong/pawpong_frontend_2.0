import type {
  CreatePetPostingRequest,
  CommunityPetType,
  PetVaccinationRecord,
  PetGeneticTestRecord,
  ParentPetSnapshot,
  PetBreedingEnvironment,
} from '@/shared/types'
import type { AdoptionCreateFormValues } from './schema'

/** "20,000원" 등 표시용 문자열에서 숫자만 추출 */
const toNumericPrice = (raw: string): number => Number(raw.replace(/[^0-9]/g, ''))

/** 하이픈 없는 8자리(YYYYMMDD)를 YYYY-MM-DD 로 정규화 (백엔드 @IsDateString 대응) */
const normalizeDate = (raw: string): string => {
  const trimmed = raw.trim()
  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`
  }
  return trimmed
}

/** 날짜 형식(YYYY-MM-DD 또는 YYYYMMDD)인지 판별 */
const isDateLike = (raw?: string): boolean =>
  !!raw && /^(\d{4}-\d{2}-\d{2}|\d{8})$/.test(raw.trim())

/** 폼 상태(접종 중/미접종 3종)를 DTO 2종(completed|incomplete)으로 축약 */
const collapseStatus = (status: string): 'completed' | 'incomplete' =>
  status === 'completed' ? 'completed' : 'incomplete'

/**
 * 분양글 작성 폼 값 + 업로드된 사진 파일명을 백엔드 CreateBreederPetPostingRequestDto 로 매핑한다.
 * - 빈 기본 행은 제거하고, 상태(완료/미완료)에 따라 records 또는 incompleteReason만 포함
 * - petType(강아지/고양이/파충류)을 전송해 종별 필터 탭에 노출되도록 함
 */
export const toPetPostingRequest = (
  values: AdoptionCreateFormValues,
  photos: string[],
  representativePhotoIndex: number,
): CreatePetPostingRequest => {
  const vaccinationStatus = collapseStatus(values.vaccinationStatus)
  const geneticTestStatus = collapseStatus(values.geneticTestStatus)

  const vaccinationRecords: PetVaccinationRecord[] =
    vaccinationStatus === 'completed'
      ? (values.vaccinations ?? [])
          .filter((r) => r.name?.trim() && r.date?.trim() && r.dose?.trim())
          .map((r) => ({
            name: r.name!.trim(),
            date: normalizeDate(r.date!),
            round: Number(r.dose),
          }))
      : []

  const geneticTestRecords: PetGeneticTestRecord[] =
    geneticTestStatus === 'completed'
      ? (values.geneticTests ?? [])
          .filter((r) => r.date?.trim() && r.institution?.trim() && r.result?.trim())
          .map((r) => ({
            date: normalizeDate(r.date!),
            institution: r.institution!.trim(),
            // 폼에 별도 검사명 입력이 없어 병명(비정상 시) 또는 기본값으로 대체
            testName: r.diseaseName?.trim() || '유전병 검사',
            result: r.result === 'abnormal' ? '비정상' : '정상',
          }))
      : []

  const parentPetSnapshots: ParentPetSnapshot[] = (values.parents ?? [])
    .filter((p) => p.relationship?.trim() && p.breedAndName?.trim())
    .map((p) => {
      const label = p.breedAndName!.trim()
      return {
        relation: p.relationship === 'dad' ? 'father' : 'mother',
        // 폼은 품종·이름이 한 필드라 둘 다 필수인 백엔드에 동일 값으로 매핑(MVP)
        breed: label,
        name: label,
        ...(isDateLike(p.birthDate) ? { birthDate: normalizeDate(p.birthDate!) } : {}),
      }
    })

  const breedingEnvironment: PetBreedingEnvironment | undefined =
    values.breedingEnvDescription?.trim()
      ? { description: values.breedingEnvDescription.trim() }
      : undefined

  const request: CreatePetPostingRequest = {
    name: values.name.trim(),
    breed: values.breed.trim(),
    gender: values.gender as 'male' | 'female',
    birthDate: normalizeDate(values.birthDate),
    price: toNumericPrice(values.price),
    description: values.introduction.trim(),
    photos,
    representativePhotoIndex,
    petType: values.petType as CommunityPetType,
    vaccinationStatus,
    geneticTestStatus,
  }

  if (vaccinationStatus === 'completed') {
    request.vaccinationRecords = vaccinationRecords
  } else if (values.vaccinationReason?.trim()) {
    request.vaccinationIncompleteReason = values.vaccinationReason.trim()
  }

  if (geneticTestStatus === 'completed') {
    request.geneticTestRecords = geneticTestRecords
  } else if (values.geneticTestReason?.trim()) {
    request.geneticTestIncompleteReason = values.geneticTestReason.trim()
  }

  if (parentPetSnapshots.length > 0) request.parentPetSnapshots = parentPetSnapshots
  if (breedingEnvironment) request.breedingEnvironment = breedingEnvironment

  return request
}
