import { requireRole } from '@/features/auth/server'
import { EditApplicationPageContent } from './_ui/EditApplicationPageContent'

interface EditApplicationPageProps {
  params: Promise<{ applicationId: string }>
}

const EditApplicationPage = async ({ params }: EditApplicationPageProps) => {
  const { applicationId } = await params
  await requireRole('adopter', `/activity/applications/${applicationId}/edit`)

  return <EditApplicationPageContent applicationId={applicationId} />
}

export default EditApplicationPage
