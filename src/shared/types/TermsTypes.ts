/** 약관 관련 타입 정의 */

/** 약관 코드 */
export type TermsCode = 'service' | 'privacy' | 'marketing' | 'age_14plus' | 'counsel_privacy'

/** 약관 */
export interface Terms {
  termsId: string
  code: TermsCode
  version: string
  title: string
  body: string
  isRequired: boolean
  activatedAt?: string
  createdAt: string
  updatedAt: string
}
