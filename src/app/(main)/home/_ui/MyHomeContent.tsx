'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { BookmarkIcon } from '@/shared/assets'
import { Container, CtaBanner, DeleteConfirmModal, NavigationBar, InputUpload } from '@/shared/ui'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { profileQueries } from '@/entities/profile'
import { communityQueries } from '@/entities/community'
import { useDeleteCommunityPost } from '@/features/community'
// [refactored] 분양 페이지와 동일한 목록 블록 — 위젯으로 공유
import { MyPetPostingList } from '@/widgets/my-pet-postings'
import { toMyProfileCardProps } from '../_lib/toMyProfileCardProps'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { PostList } from './PostList'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { MY_HOME_TABS, BREEDER_MY_HOME_TABS } from './constants'

const HOME_LISTING_PAGE_SIZE = 16

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
  const isBreeder = myProfile?.role === 'breeder'

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

  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // [refactored] 작성 바 문구/링크를 역할별로 분리 — 단일 InputUpload 인스턴스로 렌더
  const writeBar = isBreeder
    ? { text: '분양할 동물 작성하러가기', href: '/adoption/create' }
    : { text: '게시글을 올려보세요', href: '/community/write' }

  // 프로필 조회 전에는 역할을 모르므로 선택값을 비워두고, 조회 후 역할별 기본 탭을 사용한다.
  // useState(defaultTab)로 바로 시드하면 최초 adopter 기본값('posts')이 브리더에게도 고정된다.
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const activeTab = tabs.find((tab) => tab.id === selectedTab)?.id ?? defaultTab
  const posts = myPostsData?.items ?? []
  const draftCount = draftsData?.items.length ?? 0
  const profileCardProps = myProfile ? toMyProfileCardProps(myProfile) : null

  if (!profileCardProps) return null

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
        <ProfileCard {...profileCardProps} />
      </Container>

      <HomeTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setSelectedTab}
        stickyTop={gnbH + navH}
      >
        {/* 브리더: 분양글 작성 바 / 일반: 게시글 작성 바 (공통 InputUpload, 상·하 보더 포함) */}
        <InputUpload text={writeBar.text} href={writeBar.href} />

        {/* 분양 목록 탭 (브리더만) — 시안 3170-790275: 배너 -> 라벨+필터 -> 카드 4열 */}
        {isBreeder && (
          <TabsContent value="listings" className="mt-0">
            {/* 배너는 콘텐츠 Container 밖의 독립 밴드 (시안 3170-800323) — 홈 CTA 스트립과 같은 배치.
                위쪽은 작성 바(InputUpload)의 보더와 붙지 않게 여백을 더 준다 */}
            <Container className="px-4 pt-10 pb-2">
              <CtaBanner text="분양 페이지 바로가기" href="/adoption" />
            </Container>

            <Container className="py-5 tab:py-10">
              <MyPetPostingList
                pageSize={HOME_LISTING_PAGE_SIZE}
                gridClassName="pc:gap-x-[1.375rem]"
              />
            </Container>
          </TabsContent>
        )}

        {/* 디자인: 모바일(1023-23241) px-16·py-24 / 탭·PC(2046-160971) px-48·80·py-40 */}
        <TabsContent value="posts" className="mt-0">
          <Container className="px-4 py-6 tab:py-10">
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
              onEdit={(postId) => router.push(`/community/post/${postId}/edit`)}
              onDelete={setDeleteTargetId}
            />
          </Container>
        </TabsContent>

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
