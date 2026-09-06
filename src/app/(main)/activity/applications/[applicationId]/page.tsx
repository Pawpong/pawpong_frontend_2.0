import { requireAuth } from '@/features/auth/server'
import { ApplicationDetailContent } from './_ui/ApplicationDetailContent'
import { ReceivedApplicationDetailContent } from './_ui/ReceivedApplicationDetailContent'

interface ApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
}

const ApplicationDetailPage = async ({ params }: ApplicationDetailPageProps) => {
  const { applicationId } = await params
  const userRole = await requireAuth(`/activity/applications/${applicationId}`)

  return userRole === 'breeder' ? (
    <ReceivedApplicationDetailContent applicationId={applicationId} />
  ) : (
    <ApplicationDetailContent applicationId={applicationId} />
  )
}

export default ApplicationDetailPage
