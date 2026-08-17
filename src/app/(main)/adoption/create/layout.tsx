import { requireRole } from '@/features/auth/server'

/** 분양글 작성과 작성 완료 화면은 승인된 브리더만 접근할 수 있다. */
const AdoptionCreateLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireRole('breeder', '/adoption/create')
  return children
}

export default AdoptionCreateLayout
