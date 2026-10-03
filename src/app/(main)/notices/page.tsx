import { createPageMetadata } from '@/shared/lib/metadata'

import { NoticesContent } from './_ui/NoticesContent'

export const metadata = createPageMetadata({
  title: '공지사항',
  description: '포퐁의 새로운 소식과 서비스 공지를 확인하세요.',
  path: '/notices',
})

const NoticesPage = () => <NoticesContent />

export default NoticesPage
