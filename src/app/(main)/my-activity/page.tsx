import { createPageMetadata } from '@/shared/lib/metadata'
import { requireAuth } from '@/features/auth/server'
import { MyActivityContent } from './_ui/MyActivityContent'

export const metadata = createPageMetadata({ title: '나의 활동', noIndex: true })

const MyActivityPage = async () => {
  // 비로그인이면 빈 화면 대신 바로 로그인으로 보낸다 (마이홈과 같은 방식)
  await requireAuth('/my-activity')
  return <MyActivityContent />
}

export default MyActivityPage
