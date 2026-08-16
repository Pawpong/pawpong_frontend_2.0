import type { Terms, TermsAgreementItem, TermsCode } from '@/shared/types'

/** 입양자 가입에 반드시 기록돼야 하는 동의 코드 (marketing 만 선택) */
export const REQUIRED_ADOPTER_TERM_CODES = [
  'service',
  'privacy',
  'age_14plus',
  'counsel_privacy',
] as const satisfies readonly TermsCode[]

interface BuildTermsAgreementsResult {
  agreements: TermsAgreementItem[]
  missingCodes: TermsCode[]
}

/**
 * 체크한 약관 코드에 활성 버전을 붙여 동의 이력으로 만든다.
 *
 * 가입 DTO 는 마케팅 동의도 별도 불리언이 아니라 이 배열에 'marketing' 을 넣는 방식이라
 * 필수/선택 구분 없이 "체크된 것만" 담는다. 활성 약관에 없는 코드는 버전을 붙일 수 없어
 * 조용히 빠지므로, 호출부가 막을 수 있도록 missingCodes 로 함께 돌려준다.
 */
export const buildTermsAgreements = (
  activeTerms: Terms[] | undefined,
  agreedByCode: Partial<Record<TermsCode, boolean>>,
): BuildTermsAgreementsResult => {
  const activeByCode = new Map((activeTerms ?? []).map((terms) => [terms.code, terms]))
  const agreedCodes = (Object.keys(agreedByCode) as TermsCode[]).filter(
    (code) => agreedByCode[code],
  )

  return {
    agreements: agreedCodes.flatMap((code) => {
      const terms = activeByCode.get(code)
      return terms ? [{ code, version: terms.version }] : []
    }),
    missingCodes: agreedCodes.filter((code) => !activeByCode.has(code)),
  }
}

export const hasAllRequiredAdopterTerms = (activeTerms: Terms[] | undefined): boolean => {
  const activeCodes = new Set((activeTerms ?? []).map(({ code }) => code))
  return REQUIRED_ADOPTER_TERM_CODES.every((code) => activeCodes.has(code))
}
