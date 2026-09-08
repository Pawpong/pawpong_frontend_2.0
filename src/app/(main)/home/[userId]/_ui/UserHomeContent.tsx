'use client'

import { useQuery } from '@tanstack/react-query'
import { AsyncState, Button, Container } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { adopterQueries } from '@/entities/adopter'
import { COLUMN_GRID } from '../../_ui/constants'
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

      {/* 마이홈과 같은 PC 2단 골격 — 탭이 없는 화면이라 HomeTabs 대신 직접 구성 */}
      <div className="pc:mx-auto pc:flex pc:w-full pc:max-w-[90rem] pc:items-start pc:gap-10 pc:px-20">
        <Container
          className="px-4 py-5 tab:px-12 tab:py-5 pc:sticky pc:w-65 pc:shrink-0 pc:px-0 pc:py-10"
          style={{ top: gnbH }}
        >
          <ProfileCard profile={profile} mode="other" layout="sidebar" />
        </Container>

        <div className="min-w-0 pc:flex-1 pc:pt-10">
          <PublicHomePosts userId={userId} className="pc:px-0" gridClassName={COLUMN_GRID} />
        </div>
      </div>
    </div>
  )
}

export { UserHomeContent }
