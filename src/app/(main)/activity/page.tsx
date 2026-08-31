import { requireRole } from '@/features/auth/server'
import { ActivityContent } from './_ui/ActivityContent'

interface ActivityPageProps {
  searchParams: Promise<{ tab?: string }>
}

const ActivityPage = async ({ searchParams }: ActivityPageProps) => {
  await requireRole('adopter', '/activity')
  const { tab } = await searchParams

  return <ActivityContent initialTab={tab === 'reviews' ? 'reviews' : 'applications'} />
}

export default ActivityPage
