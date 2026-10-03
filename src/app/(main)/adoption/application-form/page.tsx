import { createPageMetadata } from '@/shared/lib/metadata'

import { requireRole } from '@/features/auth/server'
import { ApplicationFormContent } from './_ui/ApplicationFormContent'

export const metadata = createPageMetadata({ title: '신청서 관리', noIndex: true })

/** 브리더 신청서 커스텀 질문 관리 — 입양자는 진입할 수 없다 */
const ApplicationFormPage = async () => {
  await requireRole('breeder', '/adoption/application-form')

  return <ApplicationFormContent />
}

export default ApplicationFormPage
