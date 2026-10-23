'use client'

import { useRouter } from 'next/navigation'
import { TabBar, TabsContent } from '@/shared/ui'
import { ApplicationList } from './ApplicationList'
import { ReviewList } from './ReviewList'
import { ReceivedApplicationList } from './ReceivedApplicationList'
import { ReceivedReviewList } from './ReceivedReviewList'
import { CounselProfileForm } from './CounselProfileForm'
import { isActivityTab, type ActivityTab } from '../_lib/activityTab'

type ActivityUserRole = 'adopter' | 'breeder'

// 입양자는 보낸 신청/작성한 후기를, 브리더는 받은 신청/받은 후기를 본다.
// 브리더는 입양 신청을 보낼 수 없어(#497, 서버 403) 보낸 신청·보낸 후기 탭은 두지 않는다.
const TABS_BY_ROLE: Record<
  ActivityUserRole,
  ReadonlyArray<{ value: ActivityTab; label: string }>
> = {
  adopter: [
    { value: 'applications', label: '신청 내역' },
    { value: 'reviews', label: '내 후기' },
    // 신청마다 같은 내용을 다시 쓰지 않도록, 가입 때 작성한 공통 신청서를 여기서 고친다
    { value: 'counsel-profile', label: '내 신청서' },
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
    const nextTab: ActivityTab = isActivityTab(value) ? value : 'applications'
    router.replace(`/activity?tab=${nextTab}`, { scroll: false })
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <TabBar
        items={TABS_BY_ROLE[userRole]}
        value={initialTab}
        onValueChange={changeTab}
        ariaLabel="신청과 후기 내역"
        triggerClassName="min-w-0 after:max-w-full focus-ring"
      >
        <TabsContent value="applications" className="mt-0">
          {isBreeder ? <ReceivedApplicationList /> : <ApplicationList />}
        </TabsContent>
        <TabsContent value="reviews" className="mt-0">
          {isBreeder ? <ReceivedReviewList /> : <ReviewList />}
        </TabsContent>
        {/* 공통 신청서는 입양자 스키마(counselDefaultProfile)에만 있어 브리더 탭에서는 제외한다 */}
        {!isBreeder && (
          <TabsContent value="counsel-profile" className="mt-0">
            <CounselProfileForm />
          </TabsContent>
        )}
      </TabBar>
    </div>
  )
}

export { ActivityContent }
