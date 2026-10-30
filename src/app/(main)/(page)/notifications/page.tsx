import { createPageMetadata } from '@/shared/lib/metadata'

import { NotificationsContent } from './_ui/NotificationsContent'

export const metadata = createPageMetadata({ title: '알림', noIndex: true })

const NotificationsPage = () => <NotificationsContent />

export default NotificationsPage
