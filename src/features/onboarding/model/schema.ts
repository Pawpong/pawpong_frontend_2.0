import { z } from 'zod'
import { hasEmailVerification } from './contactVerification'

const PHONE_REGEX = /^01[016789]\d{7,8}$/
const ANIMAL_TYPES = ['cat', 'dog', 'lizard'] as const
export const SURVEY_TEXT_MAX_LENGTH = 100

export const uploadedProfileImageSchema = z.object({
  filename: z.string().min(1),
  url: z.string().min(1),
})

export type UploadedProfileImageFormValue = z.infer<typeof uploadedProfileImageSchema>

// ─── ProfileStep (공통) ───────────────────────────────────────

export const profileSchema = z
  .object({
    // 휴대폰 경로는 소셜 이메일, 이메일 경로는 실제 인증받을 수신 주소를 사용한다.
    email: z.email({ error: '올바른 이메일을 입력해주세요' }),
    phone: z.string(),
    // 인증 완료 후에는 persist 시 코드를 지워도 이전 단계로 돌아올 수 있다.
    verificationCode: z.string(),
    phoneVerified: z.boolean(),
    verificationMethod: z.enum(['phone', 'email']).optional(),
    phoneFailureCount: z.number().int().min(0).optional(),
    emailVerificationCode: z.string().optional(),
    emailVerified: z.boolean().optional(),
    emailVerifiedFor: z.string().optional(),
    emailVerificationToken: z.string().optional(),
    emailVerificationExpiresAt: z.string().optional(),
    emailServerTimeOffsetMs: z.number().finite().optional(),
    serviceAgreed: z.boolean().refine((v) => v, { error: '서비스 이용약관에 동의해주세요' }),
    privacyAgreed: z.boolean().refine((v) => v, { error: '개인정보 수집에 동의해주세요' }),
    marketingAgreed: z.boolean(),
    isOver14: z.boolean().refine((v) => v, { error: '만 14세 이상이어야 합니다' }),
  })
  .superRefine((data, context) => {
    if (data.verificationMethod === 'email') {
      if (!hasEmailVerification(data)) {
        context.addIssue({
          code: 'custom',
          path: ['emailVerificationToken'],
          message: '이메일 인증을 완료해주세요. 만료됐다면 인증 메일을 다시 받아주세요.',
        })
      }
      return
    }
    if (!PHONE_REGEX.test(data.phone.replace(/-/g, ''))) {
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: data.phone ? '올바른 휴대폰번호를 입력해주세요' : '휴대폰번호를 입력해주세요',
      })
    }
    if (data.phoneVerified) return
    if (!data.verificationCode) {
      context.addIssue({
        code: 'custom',
        path: ['verificationCode'],
        message: '인증번호를 입력해주세요',
      })
    } else if (!/^\d{6}$/.test(data.verificationCode)) {
      context.addIssue({
        code: 'custom',
        path: ['verificationCode'],
        message: '인증번호 숫자 6자리를 입력해주세요',
      })
    } else {
      context.addIssue({
        code: 'custom',
        path: ['phoneVerified'],
        message: '휴대폰 인증을 완료해주세요',
      })
    }
  })

export type ProfileFormData = z.infer<typeof profileSchema>

// ─── InfoStep (일반) ──────────────────────────────────────────

export const INTRODUCTION_MAX_LENGTH = 200

export const infoSchema = z.object({
  nickname: z
    .string()
    .min(2, { error: '닉네임을 2자 이상 입력해주세요' })
    .max(10, { error: '닉네임은 10자 이하로 입력해주세요' })
    .regex(/^[a-zA-Z0-9가-힣]+$/, { error: '닉네임은 한글, 영문, 숫자만 사용할 수 있어요' }),
  selectedKeywords: z.array(z.string()),
  // 가입용 파일명과 화면 미리보기 URL (선택)
  profileImage: uploadedProfileImageSchema.optional(),
  // 소개 — 가입 요청의 bio 로 전송 (선택). 서버 제한(200자)과 동일
  introduction: z.string().max(INTRODUCTION_MAX_LENGTH).optional(),
})

export type InfoFormData = z.infer<typeof infoSchema>

// ─── SurveyStep (일반) ────────────────────────────────────────

// UI 기준: 개인정보 동의만 필수, 자기소개/집비우는시간/생활공간은 "선택"(optional).
// 이름·휴대폰·이메일은 이 스텝에서 입력받지 않고 이전 스텝/소셜 세션에서 가져오므로 스키마에서 제외.
export const surveySchema = z
  .object({
    privacyAgreed: z.boolean().refine((v) => v, { error: '개인정보 수집에 동의해주세요' }),
    selfIntro: z.string().max(SURVEY_TEXT_MAX_LENGTH).optional(),
    awayTime: z.string().max(SURVEY_TEXT_MAX_LENGTH).optional(),
    livingSpace: z.string().max(SURVEY_TEXT_MAX_LENGTH).optional(),
  })
  .superRefine((data, context) => {
    const hasAdditionalAnswer = Boolean(data.awayTime?.trim() || data.livingSpace?.trim())
    if (hasAdditionalAnswer && !data.selfIntro?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['selfIntro'],
        message: '생활 정보를 저장하려면 자기소개도 함께 작성해주세요',
      })
    }
  })

export type SurveyFormData = z.infer<typeof surveySchema>

// ─── AnimalSelectStep (브리더) ────────────────────────────────

export const animalSelectSchema = z.object({
  selected: z.enum(ANIMAL_TYPES, { error: '동물을 선택해주세요' }),
})

export type AnimalSelectFormData = z.infer<typeof animalSelectSchema>

// ─── KennelInfoStep (브리더) ──────────────────────────────────

export const kennelInfoSchema = z.object({
  breederName: z
    .string()
    .min(1, { error: '브리더명을 입력해주세요' })
    .max(30, { error: '브리더명은 30자 이하로 입력해주세요' }),
  // 지역 값은 서버 목록(GET /districts)에서 고른 그대로 보낸다 — 프로필 편집과 같은 표기.
  // 시/군구는 가입 API가 선택으로 받아 필수로 막지 않는다
  city: z.string().min(1, { error: '지역을 선택해주세요' }),
  district: z.string(),
  // 서버가 6개 이상을 거부한다 (breeds must contain no more than 5 elements)
  selectedBreeds: z
    .array(z.string())
    .min(1, { error: '품종을 1개 이상 선택해주세요' })
    .max(5, { error: '품종은 최대 5개까지 선택할 수 있어요' }),
  // 가입용 파일명과 화면 미리보기 URL (선택)
  profileImage: uploadedProfileImageSchema.optional(),
  // 브리더 한 줄 소개 — 가입 완료 후 프로필 bio(PATCH /profile/me)로 저장
  introduction: z.string().max(INTRODUCTION_MAX_LENGTH).optional(),
})

export type KennelInfoFormData = z.infer<typeof kennelInfoSchema>

// ─── DocumentsStep (브리더) ───────────────────────────────────

export const documentsSchema = z.object({
  idDocument: z.instanceof(File).optional(),
  registrationCert: z.instanceof(File).optional(),
  breederAgreed: z.boolean().refine((v) => v, { error: '서약서에 동의해주세요' }),
})

export type DocumentsFormData = z.infer<typeof documentsSchema>

// ─── 상수 re-export ──────────────────────────────────────────

export { ANIMAL_TYPES }
