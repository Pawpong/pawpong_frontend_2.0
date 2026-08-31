import { requireRole } from '@/features/auth/server'
import { ApplicationDetailContent } from './_ui/ApplicationDetailContent'

interface ApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
}

const ApplicationDetailPage = async ({ params }: ApplicationDetailPageProps) => {
  const { applicationId } = await params
  await requireRole('adopter', `/activity/applications/${applicationId}`)

  return <ApplicationDetailContent applicationId={applicationId} />
}

export default ApplicationDetailPage
