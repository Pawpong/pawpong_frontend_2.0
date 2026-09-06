import type { SavePetPostingDraftRequest } from '@/shared/types'
import type { AdoptionCreateFormValues } from './schema'
import {
  createAdoptionDefaultValues,
  createGeneticTestRow,
  createParentRow,
  createVaccinationRow,
} from './defaultValues'

/** 서버가 비워 보낸 값은 폼 기본값(빈 문자열)으로 되돌린다 */
const text = (value?: string) => value ?? ''

/**
 * 임시저장 → 작성 폼 값
 *
 * 저장 매퍼(toSavePetPostingDraftRequest)의 역방향이다.
 * 임시저장은 대부분의 칸이 비어 있는 게 정상이므로, 없는 값은 기본값으로 채워
 * 폼이 항상 온전한 형태를 갖게 한다. 행 배열은 최소 1행을 유지해야
 * 화면이 빈 목록으로 무너지지 않는다.
 */
export const fromPetPostingDraft = (
  draft: SavePetPostingDraftRequest,
): AdoptionCreateFormValues => {
  const defaults = createAdoptionDefaultValues()

  const vaccinations = draft.vaccinationRecords?.length
    ? draft.vaccinationRecords.map((row) => ({
        name: text(row.name),
        date: text(row.date),
        dose: row.round === undefined ? '' : String(row.round),
      }))
    : [createVaccinationRow()]

  const geneticTests = draft.geneticTestRecords?.length
    ? draft.geneticTestRecords.map((row) => ({
        testName: text(row.testName),
        result: text(row.result),
        date: text(row.date),
        institution: text(row.institution),
      }))
    : [createGeneticTestRow()]

  const parents = draft.parentPetSnapshots?.length
    ? draft.parentPetSnapshots.map((parent) => ({
        relationship: parent.relation,
        name: text(parent.name),
        breed: text(parent.breed),
        birthDate: text(parent.birthDate),
      }))
    : [createParentRow()]

  return {
    ...defaults,
    name: text(draft.name),
    breed: text(draft.breed),
    // 가격은 폼에서 문자열 입력이라 숫자를 되돌린다 (미입력이면 빈 문자열)
    price: draft.price === undefined ? '' : String(draft.price),
    birthDate: text(draft.birthDate),
    gender: draft.gender ?? '',
    introduction: text(draft.description),
    vaccinationStatus: draft.vaccinationStatus ?? '',
    vaccinationReason: text(draft.vaccinationIncompleteReason),
    vaccinations,
    geneticTestStatus: draft.geneticTestStatus ?? '',
    geneticTestReason: text(draft.geneticTestIncompleteReason),
    geneticTests,
    parents,
    breedingEnvDescription: text(draft.breedingEnvironment?.description),
  }
}
