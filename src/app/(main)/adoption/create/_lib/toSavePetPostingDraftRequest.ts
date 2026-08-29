import type {
  ParentPetSnapshot,
  PetBreedingEnvironment,
  SavePetPostingDraftRequest,
} from '@/shared/types'
import type { AdoptionCreateFormValues } from './schema'
import type { PhotoFileNames } from './toCreatePetPostingRequest'

/** 공백만 있는 값은 저장하지 않는다 — 복원 시 '입력한 척'이 되지 않게 */
const trimmed = (value?: string) => {
  const text = value?.trim()
  return text ? text : undefined
}

/**
 * 작성 폼 → 임시저장 요청
 *
 * 발행용 매퍼(toCreatePetPostingRequest)와 달리 **검증을 통과하지 않은 값**을 받는다.
 * 임시저장은 작성 도중 아무 때나 눌리므로 대부분의 칸이 비어 있는 게 정상이고,
 * 서버도 전 필드를 선택으로 받는다. 따라서 채워진 것만 담고 빈 값은 아예 빼서,
 * 복원했을 때 사용자가 입력하지 않은 칸이 채워져 보이지 않게 한다.
 */
export const toSavePetPostingDraftRequest = (
  values: AdoptionCreateFormValues,
  photos: PhotoFileNames,
): SavePetPostingDraftRequest => {
  // 관계를 고른 행만 담되, 사진은 원래 행 인덱스로 찾아야 짝이 어긋나지 않는다
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
    trimmed(values.breedingEnvDescription) || photos.breedingEnv
      ? {
          ...(trimmed(values.breedingEnvDescription)
            ? { description: values.breedingEnvDescription }
            : {}),
          ...(photos.breedingEnv ? { photoFileName: photos.breedingEnv } : {}),
        }
      : undefined

  // 가격은 폼에서 문자열이고 미입력이면 빈 문자열이다. 숫자로 바꿀 수 있을 때만 담는다
  const price = Number(values.price)
  const hasPrice = values.price !== '' && Number.isFinite(price)

  return {
    ...(trimmed(values.name) ? { name: values.name } : {}),
    ...(trimmed(values.breed) ? { breed: values.breed } : {}),
    ...(values.gender ? { gender: values.gender } : {}),
    ...(trimmed(values.birthDate) ? { birthDate: values.birthDate } : {}),
    ...(hasPrice ? { price } : {}),
    ...(trimmed(values.introduction) ? { description: values.introduction } : {}),
    ...(photos.pet.length > 0
      ? { photos: photos.pet, representativePhotoIndex: photos.representativeIndex }
      : {}),

    ...(values.vaccinationStatus ? { vaccinationStatus: values.vaccinationStatus } : {}),
    ...(values.vaccinationStatus === 'completed'
      ? {
          vaccinationRecords: values.vaccinations
            .filter((row) => trimmed(row.name) || trimmed(row.date) || trimmed(row.dose))
            .map((row) => ({ name: row.name, date: row.date, round: Number(row.dose) || 0 })),
        }
      : trimmed(values.vaccinationReason)
        ? { vaccinationIncompleteReason: values.vaccinationReason }
        : {}),

    ...(values.geneticTestStatus ? { geneticTestStatus: values.geneticTestStatus } : {}),
    ...(values.geneticTestStatus === 'completed'
      ? {
          geneticTestRecords: values.geneticTests
            .filter(
              (row) =>
                trimmed(row.date) ||
                trimmed(row.institution) ||
                trimmed(row.testName) ||
                trimmed(row.result),
            )
            .map((row) => ({
              date: row.date,
              institution: row.institution,
              testName: row.testName,
              result: row.result,
            })),
        }
      : trimmed(values.geneticTestReason)
        ? { geneticTestIncompleteReason: values.geneticTestReason }
        : {}),

    ...(parentPetSnapshots.length > 0 ? { parentPetSnapshots } : {}),
    ...(breedingEnvironment ? { breedingEnvironment } : {}),
  }
}
