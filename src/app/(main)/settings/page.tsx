import { requireAuth } from '@/features/auth/server'
import { SettingsContent } from './_ui/SettingsContent'

const SettingsPage = async () => {
  const userRole = await requireAuth('/settings')

  return <SettingsContent userRole={userRole} />
}

export default SettingsPage
