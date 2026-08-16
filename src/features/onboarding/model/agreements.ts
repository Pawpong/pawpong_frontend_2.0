import type { TermsCode } from '@/shared/types'
import { POLICIES, type Policy } from './policyContent'

/**
 * 계정 정보 단계에서 받는 약관 동의 항목.
 * 모달 본문은 활성 약관(GET /terms)의 body 를 쓰고, 아직 없으면 로컬 전문(fallback)으로 대체한다.
 */
export const AGREEMENTS: {
  id: 'serviceAgreed' | 'privacyAgreed' | 'marketingAgreed'
  code: TermsCode
  label: string
  fallback: Policy | null
}[] = [
  {
    id: 'serviceAgreed',
    code: 'service',
    label: '(필수) 서비스 이용약관 동의',
    fallback: POLICIES.service,
  },
  {
    id: 'privacyAgreed',
    code: 'privacy',
    label: '(필수) 개인정보 수집 및 이용 동의',
    fallback: POLICIES.privacy,
  },
  {
    id: 'marketingAgreed',
    code: 'marketing',
    label: '(선택) 마케팅 수신 동의',
    fallback: null,
  },
]
