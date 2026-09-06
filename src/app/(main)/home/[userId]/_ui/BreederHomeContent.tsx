'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AsyncState, Button } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { breederQueries } from '@/entities/breeder'
import { HomeTabs, TabsContent } from '../../_ui/HomeTabs'
import { BREEDER_HOME_TABS } from '../../_ui/constants'
import { PublicBreederListings } from './PublicBreederListings'
import { PublicHomePosts } from './PublicHomePosts'
import { PublicHomeProfileSection } from './PublicHomeProfileSection'

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState('listings')
  const profileQuery = useQuery({
    ...breederQueries.publicProfile(userId),
    ...transientQueryRecoveryOptions,
    refetchOnMount: 'always',
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
      <PublicHomeProfileSection kind="breeder" profile={profile} />

      <HomeTabs tabs={BREEDER_HOME_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="listings" className="mt-0">
          <PublicBreederListings breederId={profile.breederId} />
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <PublicHomePosts userId={userId} />
        </TabsContent>
      </HomeTabs>
    </div>
  )
}

export { BreederHomeContent }
