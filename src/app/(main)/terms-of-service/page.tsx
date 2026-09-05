import type { Metadata } from 'next'
import { TermsArticle } from '../_ui/TermsArticle'
import { TERMS_OF_SERVICE_INTRO, TERMS_OF_SERVICE_SECTIONS } from './_lib/constants'

export const metadata: Metadata = { title: '이용약관 | Pawpong' }

const TermsOfServicePage = () => (
  <TermsArticle
    title="이용약관"
    intro={TERMS_OF_SERVICE_INTRO}
    sections={TERMS_OF_SERVICE_SECTIONS}
  />
)

export default TermsOfServicePage
