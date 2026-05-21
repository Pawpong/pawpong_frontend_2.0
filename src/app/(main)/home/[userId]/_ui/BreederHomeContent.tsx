'use client'

import { useState } from 'react'

import Image from 'next/image'
import { Container, Separator } from '@/shared/ui'
import { MOCK_BREEDER_PROFILE, MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { createMockListings } from '@/shared/mocks/adoption'
import { ProfileCard } from '../../_ui/ProfileCard'
import { PostCard } from '../../_ui/PostCard'
import { BreederListingCard } from '../../_ui/BreederListingCard'
import {
  BreederHomeTabs,
  TabsContent,
  type BreederTabType,
} from '../../_ui/BreederHomeTabs'

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId: _userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState<BreederTabType>('listings')
  const profile = MOCK_BREEDER_PROFILE
  const listings = createMockListings()
  const posts = MOCK_MY_HOME_POSTS

  return (
    <div className="flex w-full flex-col">
      {/* Title Section */}
      <div className="px-[1.25rem] tab:px-[6.25rem]">
        <div className="flex items-center py-[0.75rem] tab:justify-between tab:pb-[3.219rem] tab:pt-[2.969rem]">
          <div className="flex-1 tab:hidden" />
          <div className="hidden flex-1 tab:block" />
          <h1 className="text-sm font-semibold leading-[1.5] text-text-primary tab:text-xl tab:font-bold tab:leading-[1.375rem]">
            Breeder
          </h1>
          <div className="flex flex-1 justify-end tab:hidden">
            <button type="button" aria-label="즐겨찾기">
              <Image src="/star.svg" alt="즐겨찾기" width={24} height={24} />
            </button>
          </div>
          <div className="hidden flex-1 tab:block" />
        </div>
      </div>

      {/* Profile Card */}
      <Container className="pc:px-[10rem]">
        <ProfileCard profile={profile} mode="breeder" />
      </Container>

      {/* Tabs + Tab Content */}
      <BreederHomeTabs activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="listings" className="mt-0">
          <Container className="pc:px-[10rem]">
            <div className="grid grid-cols-2 gap-[0.625rem] py-[1.25rem] tab:mt-[2.959rem] tab:grid-cols-3 tab:gap-6 tab:py-0">
              {listings.map((listing) => (
                <BreederListingCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          </Container>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <Container className="pc:px-[10rem]">
            <div className="tab:mt-[2.959rem] tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
              {posts.map((post, index) => (
                <div key={post.id} className="tab:px-[3.125rem]">
                  <PostCard post={post} />
                  {index < posts.length - 1 && (
                    <Separator className="-mx-[1.25rem] w-[calc(100%+2.5rem)] bg-border-light tab:mx-0 tab:-mx-[3.125rem] tab:w-[calc(100%+6.25rem)]" />
                  )}
                </div>
              ))}
            </div>
          </Container>
        </TabsContent>
      </BreederHomeTabs>

      {/* Footer Placeholder */}
      <div className="mt-8 h-[22.1rem] w-full bg-surface-placeholder" />
    </div>
  )
}

export { BreederHomeContent }
