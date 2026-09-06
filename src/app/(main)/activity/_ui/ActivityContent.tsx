'use client'

import { useRouter } from 'next/navigation'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
import { ApplicationList } from './ApplicationList'
import { ReviewList } from './ReviewList'
import { ReceivedApplicationList } from './ReceivedApplicationList'
import { ReceivedReviewList } from './ReceivedReviewList'

type ActivityTab = 'applications' | 'reviews' | 'sent-applications' | 'sent-reviews'
type ActivityUserRole = 'adopter' | 'breeder'

const ACTIVITY_TABS: ActivityTab[] = [
  'applications',
  'reviews',
  'sent-applications',
  'sent-reviews',
]

const isActivityTab = (value: string): value is ActivityTab =>
  (ACTIVITY_TABS as string[]).includes(value)

// 입양자는 보낸 신청/작성한 후기만 본다. 브리더도 이제 다른 브리더에게 신청·후기를 보낼 수 있어
// 받은 것(신청/후기)에 더해 자기가 보낸 것도 같은 라우터에서 탭으로 본다.
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
    { value: 'sent-applications', label: '보낸 신청' },
    { value: 'sent-reviews', label: '보낸 후기' },
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
    const nextTab: ActivityTab = isActivityTab(value) ? value : 'applications'
    router.replace(`/activity?tab=${nextTab}`, { scroll: false })
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar
        title={isBreeder ? '받은/보낸 신청·후기' : '신청·후기 내역'}
        mobileTitle="신청·후기"
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
        {isBreeder && (
          <TabsContent value="sent-applications" className="mt-0">
            <ApplicationList />
          </TabsContent>
        )}
        {isBreeder && (
          <TabsContent value="sent-reviews" className="mt-0">
            <ReviewList />
          </TabsContent>
        )}
      </TabBar>
    </div>
  )
}

export { ActivityContent, isActivityTab }
export type { ActivityTab }
