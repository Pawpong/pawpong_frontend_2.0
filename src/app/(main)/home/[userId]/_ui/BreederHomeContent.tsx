'use client'

import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { adoptionQueries } from '@/entities/adoption'
import { breederQueries } from '@/entities/breeder'
import { communityQueries } from '@/entities/community'
import { ProfileCard } from '../../_ui/ProfileCard'
import { BreederListingCard } from '../../_ui/BreederListingCard'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { HomeTabs, TabsContent } from '../../_ui/HomeTabs'
import { HomeTitle } from '../../_ui/HomeTitle'
import { PostList } from '../../_ui/PostList'
import { FooterPlaceholder } from '../../_ui/FooterPlaceholder'
import { BREEDER_HOME_TABS } from '../../_ui/constants'

const HOME_LISTING_PAGE_SIZE = 6
const HOME_POST_PAGE_SIZE = 30

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState('listings')
  const { data: profile } = useQuery(breederQueries.publicProfile(userId))
  const {
    data: listingsData,
    isPending: isListingsPending,
    isError: isListingsError,
    fetchNextPage: fetchNextListings,
    hasNextPage: hasNextListings,
    isFetchingNextPage: isFetchingNextListings,
  } = useInfiniteQuery(adoptionQueries.breederPets(userId, undefined, HOME_LISTING_PAGE_SIZE))
  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
  } = useInfiniteQuery(communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE))

  const listings = flattenPages(listingsData).map(mapAdoptionCard)
  const posts = flattenPages(postsData)

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
            <ListState
              isPending={isListingsPending}
              isError={isListingsError}
              isEmpty={listings.length === 0}
              loadingText="분양글을 불러오는 중입니다."
              errorText="분양글을 불러오지 못했습니다."
              emptyText="등록된 분양글이 없습니다."
            >
              <>
                <div className="grid grid-cols-2 gap-[0.625rem] py-[1.25rem] tab:hidden">
                  {listings.map((listing) => (
                    <BreederListingCard key={listing.listingId} listing={listing} />
                  ))}
                </div>
                <div className="hidden tab:mt-[2.959rem] tab:grid tab:grid-cols-3 tab:gap-6">
                  {listings.map((listing) => (
                    <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
                  ))}
                </div>
              </>
            </ListState>
            <InfiniteScrollTrigger
              onIntersect={() => void fetchNextListings()}
              hasNextPage={hasNextListings ?? false}
              isFetchingNextPage={isFetchingNextListings}
            />
          </Container>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          {/* 세로 여백은 PostList가 아닌 래퍼가 담당 (spacing-40) */}
          <Container className="tab:py-10 pc:px-[10rem]">
            <ListState
              isPending={isPostsPending}
              isError={isPostsError}
              isEmpty={posts.length === 0}
              loadingText="게시글을 불러오는 중입니다."
              errorText="게시글을 불러오지 못했습니다."
              emptyText="게시글이 없습니다."
            >
              <PostList posts={posts} />
            </ListState>
            <InfiniteScrollTrigger
              onIntersect={() => void fetchNextPosts()}
              hasNextPage={hasNextPosts ?? false}
              isFetchingNextPage={isFetchingNextPosts}
            />
          </Container>
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { BreederHomeContent }
