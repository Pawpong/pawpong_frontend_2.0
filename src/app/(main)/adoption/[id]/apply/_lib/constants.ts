import type { FieldPath } from 'react-hook-form'
import { ADOPTION_SURVEY_QUESTIONS } from '@/shared/config'
import type { ApplicationFormValues, ApplicationTextField } from './schema'

// [refactored] 신청서 문구를 한곳에 모음 — 텍스트 필드가 상수 배열(조사)과 JSX 인라인(입양계획·가족구성원)으로
// 나뉘어 있어 같은 성격의 값이 두 군데서 관리되던 것을 통일한다.

export const APPLY_TITLE = '입양 신청'

/** 신청서 텍스트 필드 (title/placeholder만 다른 같은 모양) */
interface ApplicationTextFieldConfig {
  name: ApplicationTextField
  title: string
  placeholder: string
}

export const ADOPTION_PLAN_FIELD: ApplicationTextFieldConfig = {
  name: 'adoptionPlan',
  title: '입양 계획을 간단히 작성해 주세요',
  placeholder: '생활패턴, 주거환경, 입양 시기 등을 입력해주세요',
}

export const FAMILY_MEMBERS_FIELD: ApplicationTextFieldConfig = {
  name: 'familyMembers',
  title: '함께 거주하는 가족 구성원을 입력해주세요',
  placeholder: '예) 배우자 1명, 자녀 1명, 부모님 1명',
}

/** 조사 건너뛴 입양자에게만 노출하는 문항(선택) — 온보딩 SurveyStep과 동일 문항 */
export const SURVEY_FIELDS: ApplicationTextFieldConfig[] = [
  { name: 'selfIntroduction', ...ADOPTION_SURVEY_QUESTIONS.selfIntroduction },
  { name: 'timeAwayFromHome', ...ADOPTION_SURVEY_QUESTIONS.timeAwayFromHome },
  { name: 'livingSpaceDescription', ...ADOPTION_SURVEY_QUESTIONS.livingSpaceDescription },
]

export const CONSENT_CHECKS_TITLE = '입양준비 확인을 위한 필수 항목을 체크해주세요'

export const CONSENT_CHECKS: { name: FieldPath<ApplicationFormValues>; label: string }[] = [
  { name: 'privacyConsent', label: '개인정보 수집 및 이용에 동의합니다.' },
  {
    name: 'canProvideBasicCare',
    label: '정기 예방 접종/ 건강검진/ 훈련 등 기본 케어가 가능합니다.',
  },
  {
    name: 'canAffordMedicalExpenses',
    label: '예상치 못한 질병/ 사고 치료비를 감당할 수 있습니다.',
  },
]

export const ALL_FAMILY_CONSENT_LABEL = '모든 가족 구성원이 입양에 동의했습니다.'

export const PET_FIELD_TITLE = '입양하는 동물'

export const EXIT_CONFIRM_TITLE = '입양 신청을 그만두시나요?'

export const CONSULT_CONFIRM_TITLE = '브리더와 더 자세한 입양 상담이\n이루어집니다.'

export const SUBMIT_ERROR_FALLBACK = '입양 신청에 실패했습니다.'
