import { requireRole } from '@/features/auth/server'
import { MyListingsContent } from './_ui/MyListingsContent'

/** 브리더 분양 페이지 — 입양자는 진입할 수 없다 (서버에서 걸러 화면이 그려지지 않는다) */
const MyListingsPage = async () => {
  await requireRole('breeder', '/adoption/my-listings')

  return <MyListingsContent />
}

export default MyListingsPage
