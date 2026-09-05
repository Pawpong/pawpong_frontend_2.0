'use client'

import { useQuery } from '@tanstack/react-query'
import { AsyncState, Button } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { adopterQueries } from '@/entities/adopter'
import { PublicHomePosts } from './PublicHomePosts'
import { PublicHomeProfileSection } from './PublicHomeProfileSection'

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
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
      <PublicHomePosts userId={userId} />
    </div>
  )
}

export { UserHomeContent }
