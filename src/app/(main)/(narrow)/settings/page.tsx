import { createPageMetadata } from '@/shared/lib/metadata'

import { requireAuth } from '@/features/auth/server'
import { SettingsContent } from './_ui/SettingsContent'

export const metadata = createPageMetadata({ title: '설정', noIndex: true })

const SettingsPage = async () => {
  const userRole = await requireAuth('/settings')

  return <SettingsContent userRole={userRole} />
}

export default SettingsPage
