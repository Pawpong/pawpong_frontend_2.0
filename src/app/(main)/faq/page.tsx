import { createPageMetadata } from '@/shared/lib/metadata'

import { FaqContent } from './_ui/FaqContent'

export const metadata = createPageMetadata({
  title: '자주 묻는 질문',
  description: '포퐁 이용 중 궁금한 점과 자주 묻는 질문을 확인하세요.',
  path: '/faq',
})

const FaqPage = () => <FaqContent />

export default FaqPage
