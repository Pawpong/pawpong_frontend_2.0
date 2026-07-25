'use client'

import { useState } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Container } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import type { MyHomePost } from '@/shared/mocks/myHome'
import { breederQueries } from '@/entities/breeder'
import { adoptionQueries } from '@/entities/adoption'
import { communityQueries } from '@/entities/community'
import { useCreateOrGetChatRoom } from '@/features/send-message'
import { useToggleFollow } from '@/features/profile'
import { mapAdoptionCard } from '@/app/(main)/explore/_lib/mapAdoptionCard'
import { toMyHomePost } from '../../_lib/toMyHomePost'
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
  const router = useRouter()
  const { data: profile } = useQuery(breederQueries.publicProfile(userId))

  // 상담하기 — 브리더와의 채팅방 생성/조회 후 대화로 이동
  const { mutate: startChat, isPending: isStartingChat } = useCreateOrGetChatRoom()
  const handleMessage = () => {
    startChat(
      { breederId: userId },
      {
        onSuccess: (room) => router.push(`/chat?roomId=${room.roomId}`),
        onError: (error) =>
          window.alert(error instanceof Error ? error.message : '채팅을 시작하지 못했습니다.'),
      },
    )
  }

  // 팔로우 토글 (브리더 공개 프로필엔 isFollowing 필드가 없어 초기값 false)
  const { isFollowing, toggleFollow, isPending: isFollowPending } = useToggleFollow(userId, false)

  // 분양 개체 탭 — GET /adoption?breederId=userId
  const { data: listingsData } = useInfiniteQuery(adoptionQueries.breederPets(userId))
  const listings: AdoptionListingCard[] = (
    listingsData?.pages.flatMap((page) => page.items) ?? []
  ).map(mapAdoptionCard)

  // 게시글 탭 — GET /community/posts?authorId=userId
  const { data: postsData } = useQuery(communityQueries.userPosts(userId))
  const posts: MyHomePost[] = (postsData?.items ?? []).map(toMyHomePost)

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
        <ProfileCard
          profile={profile}
          mode="breeder"
          onMessage={handleMessage}
          isMessagePending={isStartingChat}
          isFollowing={isFollowing}
          onToggleFollow={toggleFollow}
          isFollowPending={isFollowPending}
        />
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
