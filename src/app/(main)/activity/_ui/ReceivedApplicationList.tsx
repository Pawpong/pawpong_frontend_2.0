'use client'

import { breederQueries } from '@/entities/breeder'
import { ActivityInfiniteList } from './ActivityInfiniteList'
import { ReceivedApplicationRow } from './ActivityRows'

const ReceivedApplicationList = () => (
  <ActivityInfiniteList
    query={breederQueries.receivedApplications(20)}
    title="받은 신청"
    description="입양을 기다리는 신청자의 정보와 상담 진행 상황을 확인해요."
    emptyText="아직 받은 입양 신청이 없습니다."
    keyOf={(item) => item.applicationId}
    renderItem={(item) => <ReceivedApplicationRow key={item.applicationId} application={item} />}
  />
)

export { ReceivedApplicationList }
