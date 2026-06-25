'use client'

import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookmarkIcon } from '@/shared/assets/icons'
import { Container, SectionHeader, NavigationBar, InputUpload } from '@/shared/ui'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { createMockListings } from '@/shared/mocks/adoption'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { PostList } from './PostList'
import { FooterPlaceholder } from './FooterPlaceholder'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { BreederListingCard } from './BreederListingCard'
import { MY_HOME_TABS, BREEDER_MY_HOME_TABS } from './constants'

// TODO(ui-정비): UI 작업용 목데이터. 로그인 연결 시 아래 MOCK_* 제거하고 쿼리 enabled 복구
const MOCK_IS_BREEDER = false // true로 바꾸면 브리더 마이홈 확인

const MOCK_ADOPTER_PUBLIC_PROFILE: AdopterPublicProfile = {
  userId: 'mock-adopter',
  nickname: '파이리귀여워',
  profileImageUrl: undefined,
  bio: '안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면',
  bpm: 50,
  followerCount: 100,
  isFollowing: false,
}

const MOCK_BREEDER_PUBLIC_PROFILE: BreederPublicProfile = {
  breederId: 'mock-breeder',
  nickname: 'CityLizard',
  profileImageUrl: undefined,
  bio: '안녕하세요 감사해요 잘있어요 다시만나요 아침해가 뜨면 아침해가 뜨면',
  bpm: 50,
  followerCount: 100,
  level: 'new',
  plan: 'basic',
  businessLocation: {
    city: '서울',
    district: '강서구',
  },
  isFavorited: false,
}

// [refactored] 탭 패널 공통 래퍼 — TabsContent(mt-0) + Container(pc 좌우 여백) 반복 제거
// 탭 콘텐츠는 Container 기본 margin(margin-mo 20 / margin-tab 48 / margin-pc 80) 사용.
// py 등 추가 여백은 패널별 className으로 주입
const TabPanel = ({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) => (
  <TabsContent value={value} className="mt-0">
    <Container className={className}>{children}</Container>
  </TabsContent>
)

const MyHomeContent = () => {
  // UI 정비용: 쿼리 비활성화 (401 → /login 리다이렉트 방지)
  useQuery({ ...adopterQueries.profile(), enabled: false })
  useQuery({ ...breederQueries.myProfile(), enabled: false })

  const isBreeder = MOCK_IS_BREEDER

  // ===== 실제 API 연결 로직 (로그인 붙일 때 아래 블록으로 복구) =====
  // const { data: adopterProfile } = useQuery(adopterQueries.profile())
  // const { data: breederProfile } = useQuery(breederQueries.myProfile())
  //
  // const isBreeder = !!breederProfile
  //
  // const adopterPublicProfile: AdopterPublicProfile | null = adopterProfile
  //   ? {
  //       userId: adopterProfile.adopterId,
  //       nickname: adopterProfile.nickname,
  //       profileImageUrl: adopterProfile.profileImageFileName,
  //       bio: '',
  //       bpm: 0,
  //       followerCount: 0,
  //       isFollowing: false,
  //     }
  //   : null
  //
  // const breederPublicProfile: BreederPublicProfile | null = breederProfile
  //   ? {
  //       breederId: breederProfile.breederId,
  //       nickname: breederProfile.breederName,
  //       profileImageUrl: breederProfile.profileImageFileName,
  //       bio: breederProfile.profileInfo.profileDescription,
  //       bpm: 0,
  //       followerCount: 0,
  //       level: breederProfile.verificationInfo.level ?? 'new',
  //       plan: 'basic',
  //       businessLocation: {
  //         city: breederProfile.profileInfo.locationInfo.cityName,
  //         district: breederProfile.profileInfo.locationInfo.districtName,
  //       },
  //       isFavorited: false,
  //     }
  //   : null
  // ================================================================

  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // [refactored] 작성 바 문구/링크를 역할별로 분리 — 단일 InputUpload 인스턴스로 렌더
  const writeBar = isBreeder
    ? { text: '분양글을 올려보세요', href: '/adoption/create' }
    : { text: '게시글을 올려보세요', href: '/post/create' }

  const [activeTab, setActiveTab] = useState(defaultTab)
  const posts = MOCK_MY_HOME_POSTS
  const listings = isBreeder ? createMockListings() : []

  const adopterPublicProfile: AdopterPublicProfile | null = isBreeder
    ? null
    : MOCK_ADOPTER_PUBLIC_PROFILE
  const breederPublicProfile: BreederPublicProfile | null = isBreeder
    ? MOCK_BREEDER_PUBLIC_PROFILE
    : null

  if (!adopterPublicProfile && !breederPublicProfile) return null

  return (
    <div className="flex w-full flex-col">
      <NavigationBar
        title="마이홈"
        // 디자인(node 2046-160996): 마이홈 모바일 navbar는 좌우 margin-tab(48px) — 공통 기본(16)을 덮어씀
        className="px-12"
        right={
          <button type="button" aria-label="북마크">
            <BookmarkIcon className="size-6 text-[#3e3e3e]" />
          </button>
        }
      />

      {/* 디자인: 모바일 px-16(margin-mo)·py-20 / 탭 px-48·PC px-80·py-40 */}
      <Container className="px-4 py-5 tab:py-10">
        {isBreeder && breederPublicProfile ? (
          <ProfileCard profile={breederPublicProfile} mode="mine-breeder" />
        ) : adopterPublicProfile ? (
          <ProfileCard profile={adopterPublicProfile} />
        ) : null}
      </Container>

      <HomeTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* 브리더: 분양글 작성 바 / 일반: 게시글 작성 바 (공통 InputUpload, 상·하 보더 포함) */}
        <InputUpload text={writeBar.text} href={writeBar.href} />

        {/* 분양목록 탭 (브리더만) */}
        {isBreeder && (
          <TabPanel value="listings" className="pc:px-[10rem]">
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
          </TabPanel>
        )}

        {/* 디자인(2046-160971): Container 기본 margin(pc 80px) + spacing-40(py-40) */}
        <TabPanel value="posts" className="tab:py-10">
          <PostList posts={posts} />
        </TabPanel>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </HomeTabs>

      <FooterPlaceholder />
    </div>
  )
}

export { MyHomeContent }
