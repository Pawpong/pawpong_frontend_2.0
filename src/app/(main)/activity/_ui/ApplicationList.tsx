'use client'

import { applicationQueries } from '@/entities/application'
import { EmptyStateLink } from '@/shared/ui/EmptyStateLink'
import { ActivityInfiniteList } from './ActivityInfiniteList'
import { ApplicationRow } from './ActivityRows'

const ApplicationList = () => (
  <ActivityInfiniteList
    query={applicationQueries.myList(undefined, 20)}
    title="보낸 신청"
    description="보낸 입양 신청과 상담 진행 상황을 확인해요."
    emptyText="아직 보낸 입양 신청이 없어요."
    emptyAction={<EmptyStateLink href="/explore?type=adoption">분양중인 동물 보기</EmptyStateLink>}
    keyOf={(item) => item.applicationId}
    renderItem={(item) => <ApplicationRow key={item.applicationId} application={item} />}
  />
)

export { ApplicationList }
