import { requireRole } from '@/features/auth/server'
import { ReceivedApplicationDetailContent } from './_ui/ReceivedApplicationDetailContent'

interface ReceivedApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>
}

const ReceivedApplicationDetailPage = async ({ params }: ReceivedApplicationDetailPageProps) => {
  const { applicationId } = await params
  await requireRole('breeder', `/home/applications/${applicationId}`)

  return <ReceivedApplicationDetailContent applicationId={applicationId} />
}

export default ReceivedApplicationDetailPage
