import { z } from 'zod'

const PHONE_REGEX = /^01[016789]\d{7,8}$/
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'hanmail.net'] as const
const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const
const ANIMAL_TYPES = ['cat', 'dog', 'lizard'] as const

// ─── ProfileStep (공통) ───────────────────────────────────────

export const profileSchema = z.object({
  email: z.string().min(1, { error: '이메일을 입력해주세요' }),
  emailDomain: z.enum(EMAIL_DOMAINS),
  phone: z
    .string()
    .min(1, { error: '휴대폰번호를 입력해주세요' })
    .regex(PHONE_REGEX, { error: '올바른 휴대폰번호를 입력해주세요' }),
  verificationCode: z
    .string()
    .min(1, { error: '인증번호를 입력해주세요' })
    .length(6, { error: '인증번호 6자리를 입력해주세요' }),
  serviceAgreed: z.literal(true, { error: '서비스 이용약관에 동의해주세요' }),
  privacyAgreed: z.literal(true, { error: '개인정보 수집에 동의해주세요' }),
  marketingAgreed: z.boolean(),
  isOver14: z.literal(true, { error: '만 14세 이상이어야 합니다' }),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ─── InfoStep (일반) ──────────────────────────────────────────

export const infoSchema = z.object({
  nickname: z.string().min(2, { error: '닉네임을 2자 이상 입력해주세요' }),
  selectedKeywords: z.array(z.string()),
})

export type InfoFormData = z.infer<typeof infoSchema>

// ─── SurveyStep (일반) ────────────────────────────────────────

export const surveySchema = z.object({
  privacyAgreed: z.literal(true, { error: '개인정보 수집에 동의해주세요' }),
  name: z.string().min(1, { error: '이름을 입력해주세요' }),
  phone: z
    .string()
    .min(1, { error: '휴대폰번호를 입력해주세요' })
    .regex(PHONE_REGEX, { error: '올바른 휴대폰번호를 입력해주세요' }),
  email: z.string().min(1, { error: '이메일을 입력해주세요' }),
  emailDomain: z.enum(EMAIL_DOMAINS),
  selfIntro: z.string().min(1, { error: '자기소개를 입력해주세요' }),
  awayTime: z.string().min(1, { error: '집을 비우는 시간을 입력해주세요' }),
  livingSpace: z.string().min(1, { error: '생활 공간을 소개해주세요' }),
})

export type SurveyFormData = z.infer<typeof surveySchema>

// ─── AnimalSelectStep (브리더) ────────────────────────────────

export const animalSelectSchema = z.object({
  selected: z.enum(ANIMAL_TYPES, { error: '동물을 선택해주세요' }),
})

export type AnimalSelectFormData = z.infer<typeof animalSelectSchema>

// ─── KennelInfoStep (브리더) ──────────────────────────────────

export const kennelInfoSchema = z.object({
  breederName: z.string().min(1, { error: '브리더명을 입력해주세요' }),
  region: z.enum(REGIONS).optional(),
  selectedBreeds: z.array(z.string()),
})

export type KennelInfoFormData = z.infer<typeof kennelInfoSchema>

// ─── DocumentsStep (브리더) ───────────────────────────────────

export const documentsSchema = z.object({
  idDocument: z.instanceof(File).optional(),
  registrationCert: z.instanceof(File).optional(),
  breederAgreed: z.literal(true, { error: '서약서에 동의해주세요' }),
})

export type DocumentsFormData = z.infer<typeof documentsSchema>

// ─── 상수 re-export ──────────────────────────────────────────

export { EMAIL_DOMAINS, REGIONS, ANIMAL_TYPES }
