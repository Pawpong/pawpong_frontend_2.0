import { requireAuth } from '@/features/auth/server'
import { ActivityContent } from './_ui/ActivityContent'

interface ActivityPageProps {
  searchParams: Promise<{ tab?: string }>
}

const ActivityPage = async ({ searchParams }: ActivityPageProps) => {
  const userRole = await requireAuth('/activity')
  const { tab } = await searchParams

  return (
    <ActivityContent
      userRole={userRole}
      initialTab={tab === 'reviews' ? 'reviews' : 'applications'}
    />
  )
}

export default ActivityPage
