'use client'

import { useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  AsyncState,
  Button,
  Container,
  InfiniteScrollTrigger,
  ListState,
  ListingCardGrid,
  NavigationBar,
} from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { adoptionQueries } from '@/entities/adoption'
import { breederQueries } from '@/entities/breeder'
import { communityQueries } from '@/entities/community'
import { ProfileCard } from '../../_ui/ProfileCard'
import { BreederListingCard } from '../../_ui/BreederListingCard'
import { FavoriteBreederIconButton } from '../../_ui/FavoriteBreederIconButton'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { HomeTabs, TabsContent } from '../../_ui/HomeTabs'
import { PostList } from '../../_ui/PostList'
import { BREEDER_HOME_TABS } from '../../_ui/constants'

// 이 탭이 곧 분양글 목록 전체라 마이홈 프리뷰(6)보다 크게 받는다 (서버 상한 60)
const HOME_LISTING_PAGE_SIZE = 16
const HOME_POST_PAGE_SIZE = 30

interface BreederHomeContentProps {
  userId: string
}

const BreederHomeContent = ({ userId }: BreederHomeContentProps) => {
  const [activeTab, setActiveTab] = useState('listings')
  const profileQuery = useQuery({
    ...breederQueries.publicProfile(userId),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const profile = profileQuery.data
  const {
    data: listingsData,
    isPending: isListingsPending,
    isError: isListingsError,
    fetchNextPage: fetchNextListings,
    hasNextPage: hasNextListings,
    isFetchingNextPage: isFetchingNextListings,
    refetch: refetchListings,
  } = useInfiniteQuery({
    ...adoptionQueries.breederPets(userId, undefined, HOME_LISTING_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    ...communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })

  // 무한스크롤 페이지 병합 시 id 중복 제거 (React key 중복 방어)
  const listings = dedupeBy(
    flattenPages(listingsData).map(mapAdoptionCard),
    (listing) => listing.listingId,
  )
  const posts = dedupeBy(flattenPages(postsData), (post) => post.postId)

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
      <NavigationBar
        title={`${profile.nickname}의 홈`}
        right={
          <FavoriteBreederIconButton
            breederId={profile.breederId}
            isFavorited={profile.isFavorited}
            size="nav"
            className="pc:hidden"
          />
        }
      />

      <Container className="px-4 py-5 tab:py-10">
        <ProfileCard profile={profile} mode="breeder" />
      </Container>

      <HomeTabs tabs={BREEDER_HOME_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="listings" className="mt-0">
          <Container>
            <ListState
              isPending={isListingsPending}
              isError={isListingsError}
              isEmpty={listings.length === 0}
              loadingText="분양글을 불러오는 중입니다."
              errorText="분양글을 불러오지 못했습니다."
              emptyText="등록된 분양글이 없습니다."
              errorAction={
                <Button variant="fill" size="sm" onClick={() => void refetchListings()}>
                  다시 시도
                </Button>
              }
            >
              <>
                <div className="mx-auto grid w-full max-w-[21.4375rem] grid-cols-[repeat(2,minmax(0,10.25rem))] justify-between gap-y-4 py-[1.25rem] tab:hidden">
                  {listings.map((listing) => (
                    <BreederListingCard key={listing.listingId} listing={listing} />
                  ))}
                </div>
                {/* 즐겨찾기 브리더 탭과 같은 그리드(compact) — PC 4열·1188px 가운데 정렬.
                    이전엔 3열 고정 + 폭 제한이 없어 PC 카드가 과하게 컸다 */}
                <div className="hidden tab:mt-[2.959rem] tab:block">
                  <ListingCardGrid
                    layout="compact"
                    items={listings}
                    getKey={(listing) => listing.listingId}
                    renderItem={(listing) => <FavoriteAdoptionCard listing={listing} />}
                  />
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
              errorAction={
                <Button variant="fill" size="sm" onClick={() => void refetchPosts()}>
                  다시 시도
                </Button>
              }
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
    </div>
  )
}

export { BreederHomeContent }
