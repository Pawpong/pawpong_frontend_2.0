import { z } from 'zod'

/** 예방접종 기록 행 */
const vaccinationRowSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
  dose: z.string().optional(),
})

/** 유전병 검사 결과 행 */
const geneticTestRowSchema = z.object({
  date: z.string().optional(),
  institution: z.string().optional(),
  result: z.string().optional(),
  diseaseName: z.string().optional(),
})

/** 부모 정보 행 */
const parentRowSchema = z.object({
  relationship: z.string().optional(),
  breedAndName: z.string().optional(),
  birthDate: z.string().optional(),
})

export const adoptionCreateSchema = z.object({
  /* ── 기본 정보 ── */
  name: z.string().optional(),
  breed: z.string().optional(),
  price: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  introduction: z.string().optional(),

  /* ── 건강 정보 ── */
  vaccinationStatus: z.string().optional(),
  vaccinationReason: z.string().optional(),
  vaccinations: z.array(vaccinationRowSchema).optional(),

  geneticTestStatus: z.string().optional(),
  geneticTestReason: z.string().optional(),
  geneticTests: z.array(geneticTestRowSchema).optional(),

  /* ── 부모 정보 ── */
  parents: z.array(parentRowSchema).optional(),

  /* ── 사육 환경 ── */
  breedingEnvDescription: z.string().optional(),
})

export type AdoptionCreateFormValues = z.infer<typeof adoptionCreateSchema>
