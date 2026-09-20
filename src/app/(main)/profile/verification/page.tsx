import { requireRole } from '@/features/auth/server'
import { VerificationContent } from './_ui/VerificationContent'

/** 브리더 인증 서류 관리 — 입양자는 진입할 수 없다 */
const VerificationPage = async () => {
  await requireRole('breeder', '/profile/verification')

  return <VerificationContent />
}

export default VerificationPage
