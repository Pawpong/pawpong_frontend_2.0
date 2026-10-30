import { requireAuth } from '@/features/auth/server'
import { ApplicationDetailContent } from './_ui/ApplicationDetailContent'
import { ReceivedApplicationDetailContent } from './_ui/ReceivedApplicationDetailContent'

interface ApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
}

const ApplicationDetailPage = async ({ params }: ApplicationDetailPageProps) => {
  const { applicationId } = await params
  const userRole = await requireAuth(`/activity/applications/${applicationId}`)

  // 브리더는 신청을 보낼 수 없어(#497) 역할만으로 받은 신청(브리더)·보낸 신청(입양자)을 가른다.
  // 알림 링크에 붙어 오는 예전 ?view= 값은 쓰지 않는다.
  return userRole === 'breeder' ? (
    <ReceivedApplicationDetailContent applicationId={applicationId} />
  ) : (
    <ApplicationDetailContent applicationId={applicationId} backHref="/activity?tab=applications" />
  )
}

export default ApplicationDetailPage
