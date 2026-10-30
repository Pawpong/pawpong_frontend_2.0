import { createPageMetadata } from '@/shared/lib/metadata'

import { requireAuth } from '@/features/auth/server'
import { NavigationBar } from '@/shared/ui/NavigationBar'
import { ContentRightsContent } from './_ui/ContentRightsContent'

export const metadata = createPageMetadata({ title: '게시물 앱 표시 동의', noIndex: true })

export default async function ContentRightsPage() {
  await requireAuth('/account/content-rights')
  return (
    <div>
      <NavigationBar title="게시물 앱 표시 동의" backHref="/settings" />
      <ContentRightsContent />
    </div>
  )
}
