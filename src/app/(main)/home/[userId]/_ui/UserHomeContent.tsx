'use client'

import { useQuery } from '@tanstack/react-query'
import { AsyncState } from '@/shared/ui'
import { HomeSkeleton } from '../../_ui/HomeSkeleton'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { adopterQueries } from '@/entities/adopter'
import { HomeColumns } from '../../_ui/HomeColumns'
import { ProfileCard } from '../../_ui/ProfileCard'
import { PublicHomePosts } from './PublicHomePosts'
import { PublicHomeProfileSection } from './PublicHomeProfileSection'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
  const gnbH = useGnbHeight()
  const profileQuery = useQuery({
    ...adopterQueries.publicProfile(userId),
    ...transientQueryRecoveryOptions,
    refetchOnMount: false,
    throwOnError: false,
  })
  const profile = profileQuery.data
  if (!profile) {
    if (!profileQuery.isError) return <HomeSkeleton />
    return (
      <AsyncState
        status="error"
        message="프로필을 불러오지 못했어요."
        onRetry={() => void profileQuery.refetch()}
        isRetrying={profileQuery.isFetching}
        className="min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

  return (
    <div className="flex w-full flex-col">
      <PublicHomeProfileSection kind="adopter" profile={profile} />

      {/* [refactored] 손으로 복제하던 2단 골격 → HomeColumns 공유 (pc: 프리픽스라 tab 구간이 빠져 있었다) */}
      <HomeColumns
        stickyTop={gnbH}
        sidebar={<ProfileCard profile={profile} mode="other" layout="sidebar" />}
      >
        {/* 입양자 홈은 탭 없이 피드 하나 — 후기·함께하는 아이는 공개 API 가 없어 두지 않는다 */}
        <PublicHomePosts userId={userId} layout="feed" />
      </HomeColumns>
    </div>
  )
}

export { UserHomeContent }
