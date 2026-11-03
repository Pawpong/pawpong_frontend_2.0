'use client'

import { useRouter } from 'next/navigation'
import { TabBar, TabsContent } from '@/shared/ui'
import { ApplicationList } from './ApplicationList'
import { ReviewList } from './ReviewList'
import { ReceivedApplicationList } from './ReceivedApplicationList'
import { ReceivedReviewList } from './ReceivedReviewList'
import { CounselProfileForm } from './CounselProfileForm'
import {
  isActivityTab,
  TABS_BY_ROLE,
  type ActivityTab,
  type ActivityUserRole,
} from '../_lib/activityTab'

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
    <div>
      <TabBar
        items={TABS_BY_ROLE[userRole]}
        value={initialTab}
        onValueChange={changeTab}
        ariaLabel="신청과 후기 내역"
      >
        <TabsContent value="applications">
          {isBreeder ? <ReceivedApplicationList /> : <ApplicationList />}
        </TabsContent>
        <TabsContent value="reviews">
          {isBreeder ? <ReceivedReviewList /> : <ReviewList />}
        </TabsContent>
        {/* 공통 신청서는 입양자 스키마(counselDefaultProfile)에만 있어 브리더 탭에서는 제외한다 */}
        {!isBreeder && (
          <TabsContent value="counsel-profile">
            <CounselProfileForm />
          </TabsContent>
        )}
      </TabBar>
    </div>
  )
}

export { ActivityContent }
