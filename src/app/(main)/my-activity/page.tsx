import { createPageMetadata } from '@/shared/lib/metadata'
import { ActivityContent } from './_ui/ActivityContent'
export const metadata = {
  ...createPageMetadata({
    title: '나의 활동',
    path: '/my-activity',
    description: '포퐁 활동과 업적 배지',
  }),
  robots: { index: false, follow: false },
}
export default function Page() {
  return <ActivityContent />
}
