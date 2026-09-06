'use client'

import { useRouter } from 'next/navigation'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
import { ApplicationList } from './ApplicationList'
import { ReviewList } from './ReviewList'
import { ReceivedApplicationList } from './ReceivedApplicationList'
import { ReceivedReviewList } from './ReceivedReviewList'

type ActivityTab = 'applications' | 'reviews'
type ActivityUserRole = 'adopter' | 'breeder'

// 입양자는 보낸 신청/작성한 후기, 브리더는 받은 신청/받은 후기 — 같은 라우터를 역할별로 분기한다
const TABS_BY_ROLE: Record<
  ActivityUserRole,
  ReadonlyArray<{ value: ActivityTab; label: string }>
> = {
  adopter: [
    { value: 'applications', label: '신청 내역' },
    { value: 'reviews', label: '내 후기' },
  ],
  breeder: [
    { value: 'applications', label: '받은 신청' },
    { value: 'reviews', label: '받은 후기' },
  ],
}

const ActivityContent = ({
  userRole,
  initialTab,
}: {
  userRole: ActivityUserRole
  initialTab: ActivityTab
}) => {
  const router = useRouter()
  const isBreeder = userRole === 'breeder'

  const changeTab = (value: string) => {
    const nextTab: ActivityTab = value === 'reviews' ? 'reviews' : 'applications'
    router.replace(`/activity?tab=${nextTab}`, { scroll: false })
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar
        title={isBreeder ? '받은 신청·후기' : '신청·후기 내역'}
        mobileTitle={isBreeder ? '받은 신청·후기' : '신청·후기'}
        backHref="/home"
      />

      <TabBar
        items={TABS_BY_ROLE[userRole]}
        value={initialTab}
        onValueChange={changeTab}
        ariaLabel="신청과 후기 내역"
      >
        <TabsContent value="applications" className="mt-0">
          {isBreeder ? <ReceivedApplicationList /> : <ApplicationList />}
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          {isBreeder ? <ReceivedReviewList /> : <ReviewList />}
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { ActivityContent }
