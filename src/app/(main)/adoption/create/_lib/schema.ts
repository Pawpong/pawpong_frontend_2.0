import { z } from 'zod'

/** 날짜 형식: YYYY-MM-DD 또는 하이픈 없는 8자리(YYYYMMDD) 허용 */
const DATE_RE = /^(\d{4}-\d{2}-\d{2}|\d{8})$/

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

// 필드 타입은 입력값 그대로 문자열로 유지(RHF register 호환). DTO 타입 변환은 제출 훅에서 수행하고,
// 여기서는 백엔드 CreateBreederPetPostingRequestDto + validator 규칙에 맞춘 필수/포맷/조건부 검증만 담당한다.
export const adoptionCreateSchema = z
  .object({
    /* ── 기본 정보 ── */
    petType: z.string(),
    name: z.string().trim().min(1, '이름을 입력해주세요.'),
    breed: z.string().trim().min(1, '품종을 입력해주세요.'),
    price: z
      .string()
      .min(1, '분양가를 입력해주세요.')
      .refine((v) => {
        const digits = v.replace(/[^0-9]/g, '')
        return digits.length > 0 && Number(digits) >= 0
      }, '분양가는 0원 이상의 숫자로 입력해주세요.'),
    birthDate: z
      .string()
      .min(1, '태어난 날짜를 입력해주세요.')
      .regex(DATE_RE, '태어난 날짜는 YYYY-MM-DD 형식으로 입력해주세요. (예: 2024-03-15)'),
    gender: z.string(),
    introduction: z
      .string()
      .trim()
      .min(1, '아이 소개를 입력해주세요.')
      .max(500, '소개는 500자 이내로 입력해주세요.'),

    /* ── 건강 정보 ── */
    vaccinationStatus: z.string().min(1, '예방 접종 현황을 선택해주세요.'),
    vaccinationReason: z.string().optional(),
    vaccinations: z.array(vaccinationRowSchema).optional(),

    geneticTestStatus: z.string().min(1, '유전병 검사 현황을 선택해주세요.'),
    geneticTestReason: z.string().optional(),
    geneticTests: z.array(geneticTestRowSchema).optional(),

    /* ── 부모 정보 ── */
    parents: z.array(parentRowSchema).optional(),

    /* ── 사육 환경 ── */
    breedingEnvDescription: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // 종류: dog/cat/reptile 중 선택 필수
    if (data.petType !== 'dog' && data.petType !== 'cat' && data.petType !== 'reptile') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['petType'],
        message: '동물 종류를 선택해주세요.',
      })
    }

    // 성별: male/female 중 선택 필수 (refine 타입 내로잉 회피 위해 여기서 검증)
    if (data.gender !== 'male' && data.gender !== 'female') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gender'],
        message: '성별을 선택해주세요.',
      })
    }

    // 예방 접종: 완료면 첫 행(접종명·접종일·차수) 필수, 그 외(접종 중/미접종)면 사유 필수
    if (data.vaccinationStatus === 'completed') {
      const row = data.vaccinations?.[0]
      if (!row?.name?.trim() || !row?.date?.trim() || !row?.dose?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vaccinations', 0, 'name'],
          message: '접종 완료 시 접종명·접종일·차수를 입력해주세요.',
        })
      } else if (!DATE_RE.test(row.date.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vaccinations', 0, 'date'],
          message: '접종일은 YYYY-MM-DD 형식으로 입력해주세요.',
        })
      }
    } else if (data.vaccinationStatus && !data.vaccinationReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vaccinationReason'],
        message: '접종 미완료 사유를 입력해주세요.',
      })
    }

    // 유전병 검사: 완료면 첫 행(검진날짜·검사기관·결과) 필수, 그 외(미완료/미검사)면 사유 필수
    if (data.geneticTestStatus === 'completed') {
      const row = data.geneticTests?.[0]
      if (!row?.date?.trim() || !row?.institution?.trim() || !row?.result?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['geneticTests', 0, 'date'],
          message: '검사 완료 시 검진날짜·검사기관·결과를 입력해주세요.',
        })
      } else if (!DATE_RE.test(row.date.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['geneticTests', 0, 'date'],
          message: '검진날짜는 YYYY-MM-DD 형식으로 입력해주세요.',
        })
      }
    } else if (data.geneticTestStatus && !data.geneticTestReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['geneticTestReason'],
        message: '유전병 검사 미완료 사유를 입력해주세요.',
      })
    }
  })

export type AdoptionCreateFormValues = z.infer<typeof adoptionCreateSchema>
