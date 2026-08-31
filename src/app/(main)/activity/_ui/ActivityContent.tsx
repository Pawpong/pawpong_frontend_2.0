'use client'

import { useRouter } from 'next/navigation'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
import { ApplicationList } from './ApplicationList'
import { ReviewList } from './ReviewList'

type ActivityTab = 'applications' | 'reviews'

const TABS = [
  { value: 'applications', label: '신청 내역' },
  { value: 'reviews', label: '내 후기' },
] as const

const ActivityContent = ({ initialTab }: { initialTab: ActivityTab }) => {
  const router = useRouter()

  const changeTab = (value: string) => {
    const nextTab: ActivityTab = value === 'reviews' ? 'reviews' : 'applications'
    router.replace(`/activity?tab=${nextTab}`, { scroll: false })
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
      <NavigationBar title="신청·후기 내역" mobileTitle="신청·후기" backHref="/home" />

      <TabBar
        items={TABS}
        value={initialTab}
        onValueChange={changeTab}
        ariaLabel="신청과 후기 내역"
      >
        <TabsContent value="applications" className="mt-0">
          <ApplicationList />
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          <ReviewList />
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { ActivityContent }
