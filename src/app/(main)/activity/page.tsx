import { requireAuth } from '@/features/auth/server'
import { ActivityContent } from './_ui/ActivityContent'
import { isActivityTab } from './_lib/activityTab'

interface ActivityPageProps {
  searchParams: Promise<{ tab?: string }>
}

const ActivityPage = async ({ searchParams }: ActivityPageProps) => {
  const userRole = await requireAuth('/activity')
  const { tab } = await searchParams

  return (
    <ActivityContent
      userRole={userRole}
      initialTab={tab && isActivityTab(tab) ? tab : 'applications'}
    />
  )
}

export default ActivityPage
