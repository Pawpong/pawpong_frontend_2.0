'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Container } from '@/shared/ui'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { createMockListings } from '@/shared/mocks/adoption'
import { breederQueries } from '@/entities/breeder'
import { ProfileCard } from '../../_ui/ProfileCard'
import { BreederListingCard } from '../../_ui/BreederListingCard'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { HomeTabs, TabsContent } from '../../_ui/HomeTabs'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'
import { BREEDER_HOME_TABS } from '../../_ui/constants'

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState('listings')
  const { data: profile } = useQuery(breederQueries.publicProfile(userId))
  // TODO: 분양 개체 / 게시글 API 연결
  const listings = createMockListings()
  const posts = MOCK_MY_HOME_POSTS

  if (!profile) return null

  return (
    <div className="flex w-full flex-col">
      <HomeTitle
        title="Breeder"
        rightAction={
          <button type="button" aria-label="즐겨찾기" className="tab:hidden">
            <Image src="/star.svg" alt="즐겨찾기" width={24} height={24} />
          </button>
        }
      />

      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} mode="breeder" />
      </Container>

      <HomeTabs tabs={BREEDER_HOME_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="listings" className="mt-0">
          <Container className="pc:px-[10rem]">
            {/* Mobile */}
            <div className="grid grid-cols-2 gap-[0.625rem] py-[1.25rem] tab:hidden">
              {listings.map((listing) => (
                <BreederListingCard key={listing.listingId} listing={listing} />
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden tab:mt-[2.959rem] tab:grid tab:grid-cols-3 tab:gap-6">
              {listings.map((listing) => (
                <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          </Container>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          {/* 세로 여백은 PostList가 아닌 래퍼가 담당 (spacing-40) */}
          <Container className="tab:py-10 pc:px-[10rem]">
            <PostList posts={posts} />
          </Container>
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { BreederHomeContent }
