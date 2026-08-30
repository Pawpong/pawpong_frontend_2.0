import { requireRole } from '@/features/auth/server'
import { AdoptionDraftsContent } from './_ui/AdoptionDraftsContent'

/** 분양글 임시저장 목록 — 브리더 전용 */
const AdoptionDraftsPage = async () => {
  await requireRole('breeder', '/adoption/drafts')

  return <AdoptionDraftsContent />
}

export default AdoptionDraftsPage
