'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookmarkIcon } from '@/shared/assets/icons'
import { Container, Separator, SectionHeader } from '@/shared/ui'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { createMockListings } from '@/shared/mocks/adoption'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { HomeTitle } from './HomeTitle'
import { PostList } from './PostList'
import { FooterPlaceholder } from './FooterPlaceholder'
import { PostCreateBar } from './PostCreateBar'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { BreederListingCard } from './BreederListingCard'
import { MY_HOME_TABS, BREEDER_MY_HOME_TABS } from './constants'

const MyHomeContent = () => {
  const { data: adopterProfile } = useQuery(adopterQueries.profile())
  const { data: breederProfile } = useQuery(breederQueries.myProfile())

  const isBreeder = !!breederProfile
  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'

  const [activeTab, setActiveTab] = useState(defaultTab)
  const posts = MOCK_MY_HOME_POSTS
  const listings = isBreeder ? createMockListings() : []

  const adopterPublicProfile: AdopterPublicProfile | null = adopterProfile
    ? {
        userId: adopterProfile.adopterId,
        nickname: adopterProfile.nickname,
        profileImageUrl: adopterProfile.profileImageFileName,
        bio: '',
        bpm: 0,
        followerCount: 0,
        isFollowing: false,
      }
    : null

  const breederPublicProfile: BreederPublicProfile | null = breederProfile
    ? {
        breederId: breederProfile.breederId,
        nickname: breederProfile.breederName,
        profileImageUrl: breederProfile.profileImageFileName,
        bio: breederProfile.profileInfo.profileDescription,
        bpm: 0,
        followerCount: 0,
        level: breederProfile.verificationInfo.level ?? 'new',
        plan: 'basic',
        businessLocation: {
          city: breederProfile.profileInfo.locationInfo.cityName,
          district: breederProfile.profileInfo.locationInfo.districtName,
        },
        isFavorited: false,
      }
    : null

  if (!adopterPublicProfile && !breederPublicProfile) return null

  return (
    <div className="flex w-full flex-col">
      <HomeTitle
        title="마이홈"
        rightAction={
          <button type="button" aria-label="북마크" className="hidden tab:block">
            <BookmarkIcon className="size-7 text-text-primary" />
          </button>
        }
      />

      <Container className="pc:px-[10rem]">
        {isBreeder && breederPublicProfile ? (
          <ProfileCard profile={breederPublicProfile} mode="mine-breeder" />
        ) : adopterPublicProfile ? (
          <ProfileCard profile={adopterPublicProfile} />
        ) : null}
      </Container>

      <HomeTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* 브리더: 분양글 작성 바 / 일반: 게시글 작성 바 */}
        <div className="px-[1.25rem] tab:px-[6.25rem]">
          {isBreeder ? (
            <PostCreateBar label="분양글 작성하기" href="/adoption/create" />
          ) : (
            <PostCreateBar />
          )}
        </div>

        <Separator className="bg-border-light" />

        {/* 분양목록 탭 (브리더만) */}
        {isBreeder && (
          <TabsContent value="listings" className="mt-0">
            <Container className="pc:px-[10rem]">
              <div className="pt-5 tab:pt-8">
                <SectionHeader title="분양목록" linkText="분양페이지 가기" linkHref="/adoption" />
              </div>
              {/* Mobile */}
              <div className="grid grid-cols-2 gap-[0.625rem] py-[1.25rem] tab:hidden">
                {listings.map((listing) => (
                  <BreederListingCard key={listing.listingId} listing={listing} />
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden tab:mt-6 tab:grid tab:grid-cols-3 tab:gap-6">
                {listings.map((listing) => (
                  <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
                ))}
              </div>
            </Container>
          </TabsContent>
        )}

        <TabsContent value="posts" className="mt-0">
          <Container className="pc:px-[10rem]">
            <PostList posts={posts} />
          </Container>
        </TabsContent>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { MyHomeContent }
