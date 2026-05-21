'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Container } from '@/shared/ui'
import { MOCK_BREEDER_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { createMockListings } from '@/shared/mocks/adoption'
import { ProfileCard } from '../../_ui/ProfileCard'
import { BreederListingCard } from '../../_ui/BreederListingCard'
import { AdoptionCard } from '@/entities/adoption'
import { HomeTabs, TabsContent, type HomeTabConfig } from '../../_ui/HomeTabs'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'

const BREEDER_HOME_TABS: HomeTabConfig[] = [
  { id: 'listings', label: '분양목록' },
  { id: 'posts', label: '게시글' },
]

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId: _userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState('listings')
  const profile = MOCK_BREEDER_PROFILE
  const listings = createMockListings()
  const posts = MOCK_MY_HOME_POSTS

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
                <AdoptionCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          </Container>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <Container className="pc:px-[10rem]">
            <PostList posts={posts} />
          </Container>
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { BreederHomeContent }
