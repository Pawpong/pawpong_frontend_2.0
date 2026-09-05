import type { Metadata } from 'next'
import { TermsArticle } from '../_ui/TermsArticle'
import { TERMS_OF_PRIVACY_INTRO, TERMS_OF_PRIVACY_SECTIONS } from './_lib/constants'

export const metadata: Metadata = { title: '개인정보처리방침 | Pawpong' }

const TermsOfPrivacyPage = () => (
  <TermsArticle
    title="개인정보처리방침"
    intro={TERMS_OF_PRIVACY_INTRO}
    sections={TERMS_OF_PRIVACY_SECTIONS}
  />
)

export default TermsOfPrivacyPage
