import { requireAuth } from '@/features/auth/server'
import { ApplicationDetailContent } from './_ui/ApplicationDetailContent'
import { ReceivedApplicationDetailContent } from './_ui/ReceivedApplicationDetailContent'

interface ApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
  searchParams: Promise<{ view?: string }>
}

const ApplicationDetailPage = async ({ params, searchParams }: ApplicationDetailPageProps) => {
  const { applicationId } = await params
  const { view } = await searchParams
  const userRole = await requireAuth(`/activity/applications/${applicationId}`)

  // 브리더도 신청을 보낼 수 있게 되면서 role만으로는 보낸/받은 신청을 구분할 수 없다.
  // 목록에서 넘겨준 view가 있으면 그걸 따르고, 없으면(직접 링크 등) role 기본값으로 되돌아간다.
  const isReceived = view === 'sent' ? false : view === 'received' ? true : userRole === 'breeder'

  return isReceived ? (
    <ReceivedApplicationDetailContent applicationId={applicationId} />
  ) : (
    <ApplicationDetailContent applicationId={applicationId} />
  )
}

export default ApplicationDetailPage
