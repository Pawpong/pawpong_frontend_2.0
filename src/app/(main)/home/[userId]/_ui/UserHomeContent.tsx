'use client'

import { useQuery } from '@tanstack/react-query'
import { AsyncState, Button } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { adopterQueries } from '@/entities/adopter'
import { PHOTO_GRID } from '../../_ui/constants'
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
    return (
      <AsyncState
        status={profileQuery.isError ? 'error' : 'loading'}
        message={
          profileQuery.isError ? '프로필을 불러오지 못했습니다.' : '프로필을 불러오는 중입니다.'
        }
        action={
          profileQuery.isError ? (
            <Button variant="fill" size="sm" onClick={() => void profileQuery.refetch()}>
              다시 시도
            </Button>
          ) : undefined
        }
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
        <PublicHomePosts userId={userId} gridClassName={PHOTO_GRID} />
      </HomeColumns>
    </div>
  )
}

export { UserHomeContent }
