import type {
  CreatePetPostingRequest,
  ParentPetSnapshot,
  PetBreedingEnvironment,
} from '@/shared/types'
import type { AdoptionCreateParsedValues } from './schema'

/**
 * 폼 값 → 분양글 작성 DTO 변환. 폼과 서버 계약이 어긋나는 지점은 전부 여기서만 흡수한다.
 * - 접종·유전병 상태는 폼에서 이미 서버 enum(completed | incomplete)을 쓴다
 * - 폼의 '유전병명'이 서버의 testName
 * - 사진은 업로드로 얻은 파일명을 인자로 받는다 (이 함수는 네트워크를 모른다)
 */

interface PhotoFileNames {
  /** 분양 개체 사진 파일명 (1~10장) */
  pet: string[]
  representativeIndex: number
  /** 부모 사진 파일명 — values.parents 와 같은 순서. 사진 없는 부모는 undefined */
  parents: (string | undefined)[]
  /** 사육 환경 사진 파일명 — 서버는 1장만 받는다 */
  breedingEnv?: string
}

export const toCreatePetPostingRequest = (
  values: AdoptionCreateParsedValues,
  photos: PhotoFileNames,
): CreatePetPostingRequest => {
  // 미선택('')은 superRefine 이 막으므로 여기 도달하면 항상 completed | incomplete
  const vaccinationStatus = values.vaccinationStatus as Exclude<typeof values.vaccinationStatus, ''>
  const geneticTestStatus = values.geneticTestStatus as Exclude<typeof values.geneticTestStatus, ''>

  // 관계를 안 고른 행은 스냅샷에서 빠지지만, 사진은 원래 행 인덱스로 찾아야 짝이 안 어긋난다
  const parentPetSnapshots = values.parents.flatMap<ParentPetSnapshot>((parent, index) => {
    if (!parent.relationship) return []
    const photoFileName = photos.parents[index]
    return [
      {
        relation: parent.relationship,
        breed: parent.breed,
        name: parent.name,
        birthDate: parent.birthDate,
        ...(photoFileName ? { photoFileName } : {}),
      },
    ]
  })

  const breedingEnvironment: PetBreedingEnvironment | undefined =
    values.breedingEnvDescription || photos.breedingEnv
      ? {
          ...(values.breedingEnvDescription ? { description: values.breedingEnvDescription } : {}),
          ...(photos.breedingEnv ? { photoFileName: photos.breedingEnv } : {}),
        }
      : undefined

  return {
    name: values.name,
    breed: values.breed,
    // gender는 superRefine이 빈 값을 막으므로 여기 도달하면 항상 male | female
    gender: values.gender as Exclude<typeof values.gender, ''>,
    birthDate: values.birthDate,
    price: values.price,
    description: values.introduction,
    photos: photos.pet,
    representativePhotoIndex: photos.representativeIndex,

    vaccinationStatus,
    ...(vaccinationStatus === 'completed'
      ? {
          vaccinationRecords: values.vaccinations.map((row) => ({
            name: row.name,
            date: row.date,
            round: Number(row.dose),
          })),
        }
      : { vaccinationIncompleteReason: values.vaccinationReason }),

    geneticTestStatus,
    ...(geneticTestStatus === 'completed'
      ? {
          geneticTestRecords: values.geneticTests.map((row) => ({
            date: row.date,
            institution: row.institution,
            testName: row.testName,
            result: row.result,
          })),
        }
      : { geneticTestIncompleteReason: values.geneticTestReason }),

    ...(parentPetSnapshots.length > 0 ? { parentPetSnapshots } : {}),
    ...(breedingEnvironment ? { breedingEnvironment } : {}),
  }
}

export type { PhotoFileNames }
