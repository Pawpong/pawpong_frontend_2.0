import { z } from 'zod'

const PHONE_REGEX = /^01[016789]\d{7,8}$/
const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'hanmail.net'] as const
const REGIONS = [
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
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
  // 업로드 후 받은 프로필 이미지 파일명/URL (선택)
  profileImage: z.string().optional(),
})

export type InfoFormData = z.infer<typeof infoSchema>

// ─── SurveyStep (일반) ────────────────────────────────────────

// UI 기준: 개인정보 동의만 필수, 자기소개/집비우는시간/생활공간은 "선택"(optional).
// 이름·휴대폰·이메일은 이 스텝에서 입력받지 않고 이전 스텝/소셜 세션에서 가져오므로 스키마에서 제외.
export const surveySchema = z.object({
  privacyAgreed: z.literal(true, { error: '개인정보 수집에 동의해주세요' }),
  selfIntro: z.string().optional(),
  awayTime: z.string().optional(),
  livingSpace: z.string().optional(),
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
  // 업로드 후 받은 브리더 프로필 이미지 URL (선택) — social/complete 시 profileImage 로 전송
  profileImage: z.string().optional(),
  // 브리더 한 줄 소개 — 가입 완료 후 프로필 bio(PATCH /profile/me)로 저장
  introduction: z.string().optional(),
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
