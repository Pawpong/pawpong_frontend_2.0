import { createPageMetadata } from '@/shared/lib/metadata'

import { TermsArticle } from '../_ui/TermsArticle'
import { TERMS_OF_SERVICE_INTRO, TERMS_OF_SERVICE_SECTIONS } from './_lib/constants'

export const metadata = createPageMetadata({
  title: '이용약관',
  description: '포퐁 서비스 이용약관을 확인하세요.',
  path: '/terms-of-service',
})

const TermsOfServicePage = () => (
  <TermsArticle
    title="이용약관"
    intro={TERMS_OF_SERVICE_INTRO}
    sections={TERMS_OF_SERVICE_SECTIONS}
  />
)

export default TermsOfServicePage
