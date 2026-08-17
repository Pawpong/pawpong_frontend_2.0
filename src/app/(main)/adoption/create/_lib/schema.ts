import type { Control } from 'react-hook-form'
import { z } from 'zod'
import {
  BREEDING_ENV_DESCRIPTION_MAX_LENGTH,
  HEALTH_REASON_MAX_LENGTH,
  HEALTH_RECORD_TEXT_MAX_LENGTH,
  PARENT_MAX_COUNT,
  PARENT_TEXT_MAX_LENGTH,
  PET_DESCRIPTION_MAX_LENGTH,
} from './constants'

/** 서버 계약: YYYY-MM-DD. 자리수뿐 아니라 실재하는 날짜인지까지 본다(2026-02-31 차단) */
const isRealDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const getLocalDateString = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 빈 문자열은 '미입력'으로 통과시키고, 값이 있으면 형식을 강제한다. 필수 여부는 superRefine이 판단 */
const dateField = z
  .string()
  .refine(
    (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value),
    'YYYY-MM-DD 형식이 아닙니다.',
  )
  .refine((value) => value === '' || isRealDate(value), '존재하지 않는 날짜입니다.')
  .refine(
    (value) => value === '' || value <= getLocalDateString(),
    '오늘 이후 날짜는 입력할 수 없습니다.',
  )

const text = (max: number) => z.string().trim().max(max, `${max}자 이내로 입력해주세요.`)

/** 접종·유전병 상태 — 서버 enum 과 동일한 2값. 빈 문자열은 '미선택'이고 superRefine 이 막는다 */
const healthStatusField = z.union([z.enum(['completed', 'incomplete']), z.literal('')])

/**
 * 분양가 — 서버는 number. 입력창(PriceInput)이 숫자만 남기고 천 단위 쉼표를 넣어주므로
 * 쉼표가 붙은 형태를 받아 숫자로 되돌린다. 그 외 문자는 거부한다.
 */
const priceField = z
  .string()
  .trim()
  .regex(/^\d{1,3}(,\d{3})*$|^\d+$/, '분양가는 숫자만 입력해주세요.')
  .transform((value) => Number(value.replaceAll(',', '')))
  .refine(Number.isSafeInteger, '입력할 수 있는 분양가 범위를 초과했습니다.')

/** 예방접종 기록 행 (서버 required: name, date, round) — 필수 여부는 status에 달려 superRefine에서 본다 */
const vaccinationRowSchema = z.object({
  name: text(HEALTH_RECORD_TEXT_MAX_LENGTH),
  date: dateField,
  dose: z.string(),
})

/** 유전병 검사 기록 행 (서버 required: date, institution, testName, result) */
const geneticTestRowSchema = z.object({
  testName: text(HEALTH_RECORD_TEXT_MAX_LENGTH),
  result: text(HEALTH_RECORD_TEXT_MAX_LENGTH),
  date: dateField,
  institution: text(HEALTH_RECORD_TEXT_MAX_LENGTH),
})

/** 부모 정보 행 (서버 required: relation, breed, name) — 부모 정보 자체는 선택 */
const parentRowSchema = z.object({
  relationship: z.union([z.enum(['mother', 'father']), z.literal('')]),
  name: text(PARENT_TEXT_MAX_LENGTH),
  breed: text(PARENT_TEXT_MAX_LENGTH),
  birthDate: dateField,
})

type VaccinationRow = z.infer<typeof vaccinationRowSchema>
type GeneticTestRow = z.infer<typeof geneticTestRowSchema>

/** 필수 입력 누락을 한 번에 등록 — path/message 쌍만 나열한다 */
type MissingRule = [condition: boolean, path: (string | number)[], message: string]

/** 상태가 completed 일 때 각 기록 행에서 비면 안 되는 필드 */
const VACCINATION_ROW_FIELDS = [
  ['name', '접종명을 입력해주세요.'],
  ['date', '접종 날짜를 입력해주세요.'],
  ['dose', '차수를 선택해주세요.'],
] as const satisfies ReadonlyArray<readonly [keyof VaccinationRow, string]>

const GENETIC_TEST_ROW_FIELDS = [
  ['testName', '유전병명을 입력해주세요.'],
  ['result', '검사 결과를 입력해주세요.'],
  ['date', '검진 날짜를 입력해주세요.'],
  ['institution', '검사 기관을 입력해주세요.'],
] as const satisfies ReadonlyArray<readonly [keyof GeneticTestRow, string]>

export const adoptionCreateSchema = z
  .object({
    /* ── 기본 정보 (전부 필수) ── */
    name: text(50),
    breed: text(50),
    birthDate: dateField,
    gender: z.union([z.enum(['male', 'female']), z.literal('')]),
    introduction: text(PET_DESCRIPTION_MAX_LENGTH),
    price: priceField,

    /* ── 건강 정보 ── */
    vaccinationStatus: healthStatusField,
    vaccinationReason: text(HEALTH_REASON_MAX_LENGTH),
    vaccinations: z.array(vaccinationRowSchema).min(1),

    geneticTestStatus: healthStatusField,
    geneticTestReason: text(HEALTH_REASON_MAX_LENGTH),
    geneticTests: z.array(geneticTestRowSchema).min(1),

    /* ── 부모 정보 (선택) ── */
    parents: z.array(parentRowSchema).max(PARENT_MAX_COUNT),

    /* ── 사육 환경 (선택) ── */
    breedingEnvDescription: text(BREEDING_ENV_DESCRIPTION_MAX_LENGTH),
  })
  .superRefine((values, ctx) => {
    const rules: MissingRule[] = [
      [!values.name, ['name'], '이름을 입력해주세요.'],
      [!values.breed, ['breed'], '품종을 입력해주세요.'],
      [!values.birthDate, ['birthDate'], '태어난 날을 입력해주세요.'],
      [!values.gender, ['gender'], '성별을 선택해주세요.'],
      [!values.introduction, ['introduction'], '소개글을 입력해주세요.'],
      [!values.vaccinationStatus, ['vaccinationStatus'], '예방 접종 현황을 선택해주세요.'],
      [!values.geneticTestStatus, ['geneticTestStatus'], '유전병 검사 상태를 선택해주세요.'],
    ]

    // [refactored] 접종·유전병 모두 "완료면 기록 필수 / 미완료면 사유 필수" 로 규칙이 같아
    // 검사할 필드 목록만 테이블로 두고 한 번에 돌린다 (서버 *IncompleteReason 계약과 대응)
    const recordSections = [
      {
        status: values.vaccinationStatus,
        rowsKey: 'vaccinations',
        rows: values.vaccinations,
        reason: values.vaccinationReason,
        reasonKey: 'vaccinationReason',
        fields: VACCINATION_ROW_FIELDS,
      },
      {
        status: values.geneticTestStatus,
        rowsKey: 'geneticTests',
        rows: values.geneticTests,
        reason: values.geneticTestReason,
        reasonKey: 'geneticTestReason',
        fields: GENETIC_TEST_ROW_FIELDS,
      },
    ] as const

    recordSections.forEach(({ status, rowsKey, rows, reason, reasonKey, fields }) => {
      if (status === 'completed') {
        rows.forEach((row: Record<string, string>, i) => {
          fields.forEach(([field, message]) => {
            rules.push([!row[field], [rowsKey, i, field], message])
          })
        })
      } else if (status) {
        rules.push([!reason, [reasonKey], '미완료 사유를 입력해주세요.'])
      }
    })

    // 부모 정보는 통째로 생략 가능하지만, 한 칸이라도 채우면 모든 필드를 필수로 받는다.
    values.parents.forEach((parent, i) => {
      if (!parent.relationship && !parent.name && !parent.breed && !parent.birthDate) return
      rules.push(
        [!parent.relationship, ['parents', i, 'relationship'], '관계를 선택해주세요.'],
        [!parent.name, ['parents', i, 'name'], '이름을 입력해주세요.'],
        [!parent.breed, ['parents', i, 'breed'], '품종을 입력해주세요.'],
        [!parent.birthDate, ['parents', i, 'birthDate'], '태어난 날짜를 입력해주세요.'],
      )
    })

    const usedRelations = new Set<string>()
    values.parents.forEach((parent, index) => {
      if (!parent.relationship) return
      if (usedRelations.has(parent.relationship)) {
        ctx.addIssue({
          code: 'custom',
          path: ['parents', index, 'relationship'],
          message: '엄마와 아빠는 각각 한 번만 등록할 수 있습니다.',
        })
      }
      usedRelations.add(parent.relationship)
    })

    rules.forEach(([missing, path, message]) => {
      if (missing) ctx.addIssue({ code: 'custom', path, message })
    })
  })

/** resolver 입력 — 사용자가 타이핑하는 값 (price는 문자열) */
export type AdoptionCreateFormValues = z.input<typeof adoptionCreateSchema>
/** 검증 통과 값 — price가 number로 변환된 상태. DTO 변환의 입력 */
export type AdoptionCreateParsedValues = z.output<typeof adoptionCreateSchema>
/** resolver가 값을 변환하므로 Control도 입력/출력 제네릭을 함께 물고 다녀야 한다 */
export type AdoptionFormControl = Control<
  AdoptionCreateFormValues,
  unknown,
  AdoptionCreateParsedValues
>
