'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BookmarkIcon } from '@/shared/assets/icons'
import {
  Container,
  DeleteConfirmModal,
  SectionHeader,
  NavigationBar,
  InputUpload,
} from '@/shared/ui'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { createMockListings } from '@/shared/mocks/adoption'
import { profileQueries } from '@/entities/profile'
import { communityQueries } from '@/entities/community'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteAdoptionCard } from '@/features/adoption'
import { useDeleteCommunityPost } from '@/features/community'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { PostList } from './PostList'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { BreederListingCard } from './BreederListingCard'
import { MY_HOME_TABS, BREEDER_MY_HOME_TABS } from './constants'

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
  const router = useRouter()
  // 내 글 카드 ⋯ 메뉴 — 수정은 상세를 편집 모드로 열고, 삭제는 확인 후 DELETE
  const deletePost = useDeleteCommunityPost()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 삭제 성공 후에만 모달을 닫는다 (실패하면 모달을 유지해 재시도 가능)
  const handleDeletePost = () => {
    if (!deleteTargetId || deletePost.isPending) return
    deletePost.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
  }

  // 마이홈 프로필 카드: /profile/me 로 내 프로필 조회 (role 에 따라 adopter/breeder 분기, 프로필 이미지 포함)
  const { data: myProfile } = useQuery(profileQueries.me())

  // 마이홈 '게시글' 탭 — 내가 작성한 커뮤니티 글을 백엔드에서 조회 (profile 로드 후 활성화)
  const { data: myPostsData } = useQuery(communityQueries.myPosts(!!myProfile))
  // 임시저장 글 수 — 있을 때만 '게시글' 탭 상단에 이어쓰기 진입점을 띄운다
  const { data: draftsData } = useQuery(communityQueries.drafts(!!myProfile))

  // sticky 헤더 스택: GNB → navbar(top=gnbH) → 탭바(top=gnbH+navH)
  const gnbH = useGnbHeight()
  const navRef = useRef<HTMLDivElement>(null)
  const [navH, setNavH] = useState(0)

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const measure = () => setNavH(nav.offsetHeight)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(nav)

    return () => observer.disconnect()
  }, [])

  const isBreeder = myProfile?.role === 'breeder'

  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // [refactored] 작성 바 문구/링크를 역할별로 분리 — 단일 InputUpload 인스턴스로 렌더
  const writeBar = isBreeder
    ? { text: '분양글을 올려보세요', href: '/adoption/create' }
    : { text: '게시글을 올려보세요', href: '/community/write' }

  const [activeTab, setActiveTab] = useState(defaultTab)
  const posts = myPostsData?.items ?? []
  const draftCount = draftsData?.items.length ?? 0
  const listings = isBreeder ? createMockListings() : []

  // /profile/me 응답을 ProfileCard 가 쓰는 공개 프로필 형태로 매핑 (프로필 이미지는 profileImageUrl)
  const adopterPublicProfile: AdopterPublicProfile | null =
    myProfile && myProfile.role === 'adopter'
      ? {
          userId: myProfile.userId,
          nickname: myProfile.nickname,
          profileImageUrl: myProfile.profileImageUrl,
          bio: myProfile.bio,
          bpm: myProfile.bpm,
          followerCount: myProfile.followerCount,
          isFollowing: false,
        }
      : null
  const breederPublicProfile: BreederPublicProfile | null =
    myProfile && myProfile.role === 'breeder'
      ? {
          breederId: myProfile.userId,
          nickname: myProfile.nickname,
          profileImageUrl: myProfile.profileImageUrl,
          bio: myProfile.bio,
          longDescription: myProfile.longDescription,
          bpm: myProfile.bpm,
          followerCount: myProfile.followerCount,
          level: myProfile.level ?? 'new',
          plan: myProfile.plan ?? 'basic',
          businessLocation: {
            city: myProfile.businessLocation?.city ?? '',
            district: myProfile.businessLocation?.district ?? '',
            address: myProfile.businessLocation?.address,
          },
          isFavorited: false,
        }
      : null

  if (!adopterPublicProfile && !breederPublicProfile) return null

  return (
    <div className="flex w-full flex-col">
      {/* 스크롤 시 GNB 아래 고정(sticky) — tab+만 */}
      <div ref={navRef} className="bg-white tab:sticky tab:z-40" style={{ top: gnbH }}>
        <NavigationBar
          title="마이홈"
          // 디자인(node 2046-160996): 마이홈 모바일 navbar는 좌우 margin-tab(48px) — 공통 기본(16)을 덮어씀
          className="px-12"
          right={
            <button type="button" aria-label="북마크">
              <BookmarkIcon className="size-6 text-neutral-850" />
            </button>
          }
        />
      </div>

      {/* 디자인: 모바일 px-16(margin-mo)·py-20 / 탭 px-48·PC px-80·py-40 */}
      <Container className="px-4 py-5 tab:py-10">
        {isBreeder && breederPublicProfile ? (
          <ProfileCard profile={breederPublicProfile} mode="mine-breeder" />
        ) : adopterPublicProfile ? (
          <ProfileCard profile={adopterPublicProfile} />
        ) : null}
      </Container>

      <HomeTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stickyTop={gnbH + navH}
      >
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

        {/* 디자인: 모바일(1023-23241) px-16·py-24 / 탭·PC(2046-160971) px-48·80·py-40 */}
        <TabPanel value="posts" className="px-4 py-6 tab:py-10">
          {/* 임시저장이 있을 때만 노출 — 목록에서 이어서 작성 */}
          {draftCount > 0 && (
            <Link
              href="/community/drafts"
              className="mb-4 flex items-center justify-between rounded-lg border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-850 tab:mx-auto tab:max-w-[59.25rem]"
            >
              <span>임시저장 {draftCount}개</span>
              <span className="text-xs font-medium text-text-secondary">이어서 쓰기</span>
            </Link>
          )}
          <PostList
            posts={posts}
            emptyText="내가 쓴 글이 없습니다."
            onEdit={(postId) => router.push(`/community/${postId}/edit`)}
            onDelete={setDeleteTargetId}
          />
        </TabPanel>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </HomeTabs>

      {/* [refactored] 게시글 삭제 확인 — 공통 DeleteConfirmModal */}
      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        target="게시글"
        onConfirm={handleDeletePost}
        isPending={deletePost.isPending}
      />
    </div>
  )
}

export { MyHomeContent }
