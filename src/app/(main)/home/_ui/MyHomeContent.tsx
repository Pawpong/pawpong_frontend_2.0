'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, BookmarkIcon } from '@/shared/assets'
import {
  Button,
  Container,
  CtaBanner,
  DeleteConfirmModal,
  InputUpload,
  ListState,
  NavigationBar,
} from '@/shared/ui'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { profileQueries } from '@/entities/profile'
import { communityQueries } from '@/entities/community'
import { useDeletePostConfirm } from '@/features/community'
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
  // 내 글 카드 ⋯ 메뉴 — 수정 화면 이동 또는 삭제 확인 후 DELETE
  // [refactored] 삭제 확인 state·mutation·핸들러를 useDeletePostConfirm으로 (커뮤니티 피드와 공유)
  const { requestDelete, modalProps: deleteModalProps } = useDeletePostConfirm()

  // 마이홈 프로필 카드: /profile/me 로 내 프로필 조회 (role 에 따라 adopter/breeder 분기, 프로필 이미지 포함)
  const profileQuery = useQuery({
    ...profileQueries.me(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const myProfile = profileQuery.data
  const isBreeder = myProfile?.role === 'breeder'

  // 마이홈 '게시글' 탭 — 내가 작성한 커뮤니티 글을 백엔드에서 조회 (profile 로드 후 활성화)
  const postsQuery = useQuery({
    ...communityQueries.myPosts(!!myProfile),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const myPostsData = postsQuery.data
  // 임시저장 글 수 — 있을 때만 '게시글' 탭 상단에 이어쓰기 진입점을 띄운다
  const { data: draftsData } = useQuery({
    ...communityQueries.drafts(!!myProfile),
    refetchOnMount: 'always',
    throwOnError: false,
  })

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
  // 프로필 조회 전에는 역할을 모르므로 선택값을 비워두고, 조회 후 역할별 기본 탭을 사용한다.
  // useState(defaultTab)로 바로 시드하면 최초 adopter 기본값('posts')이 브리더에게도 고정된다.
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const activeTab = tabs.find((tab) => tab.id === selectedTab)?.id ?? defaultTab
  const posts = myPostsData?.items ?? []
  const draftCount = draftsData?.items.length ?? 0
  const profileCardProps = myProfile ? toMyProfileCardProps(myProfile) : null

  if (!profileCardProps) {
    return (
      <div className="flex w-full flex-col">
        <NavigationBar title="마이홈" />
        <Container className="flex min-h-60 items-center justify-center px-4 py-10">
          {profileQuery.isPending ? (
            <p role="status" className="text-sm font-medium text-neutral-700">
              프로필을 불러오는 중입니다.
            </p>
          ) : (
            <div role="alert" className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-neutral-700">프로필을 불러오지 못했습니다.</p>
              <Button
                variant="fill"
                size="sm"
                onClick={() => void profileQuery.refetch()}
                className="px-4"
              >
                다시 시도
              </Button>
            </div>
          )}
        </Container>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      {/* 스크롤 시 GNB 아래 고정(sticky) — tab+만 */}
      <div ref={navRef} className="bg-white tab:sticky tab:z-sticky" style={{ top: gnbH }}>
        <NavigationBar
          title="마이홈"
          // 디자인(node 2046-160996): 마이홈 모바일 navbar는 좌우 margin-tab(48px) — 공통 기본(16)을 덮어씀
          className="px-12"
          right={
            <Link
              href="/bookmarks"
              aria-label="저장목록"
              className="-m-2 flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <BookmarkIcon className="size-6 text-neutral-850" />
            </Link>
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
        {/* 분양 목록 탭 (브리더만) — 시안 3170-790275: 배너 -> 라벨+필터 -> 카드 4열 */}
        {isBreeder && (
          <TabsContent value="listings" className="mt-0">
            <InputUpload text="분양글 작성하기" href="/adoption/create" className="px-4" />

            {/* 배너는 콘텐츠 Container 밖의 독립 밴드 (시안 3170-800323) — 홈 CTA 스트립과 같은 배치 */}
            <Container className="px-4 pt-4 pb-2">
              <CtaBanner text="분양 페이지 바로가기" href="/explore" />
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
          {/* 임시저장(보조)과 글 작성(주 액션)을 한 줄에 둬 진입점이 위아래로 쌓이지 않게 한다.
              개수 칩만 포인트 컬러로 남겨 두 액션이 같은 갈래임을 드러낸다 */}
          <InputUpload
            text="글 작성하기"
            href="/community/write"
            className="px-4"
            left={
              draftCount > 0 && (
                <Link
                  href="/community/drafts"
                  className="group inline-flex min-w-0 items-center gap-1.5 text-neutral-700 transition-colors hover:text-neutral-850"
                >
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-point-500 px-1.5 text-[0.6875rem] leading-none font-semibold text-neutral-850">
                    {draftCount}
                  </span>
                  <span className="truncate text-xs leading-[1.5] font-medium">
                    임시저장 이어서 쓰기
                  </span>
                  <ArrowRightIcon className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )
            }
          />

          <Container className="px-4 pt-2 pb-6 tab:pb-10">
            <ListState
              isPending={postsQuery.isPending}
              isError={postsQuery.isError}
              isEmpty={posts.length === 0}
              loadingText="내가 쓴 글을 불러오는 중입니다."
              errorText="내가 쓴 글을 불러오지 못했습니다."
              emptyText="내가 쓴 글이 없습니다."
              errorAction={
                <Button
                  variant="fill"
                  size="sm"
                  onClick={() => void postsQuery.refetch()}
                  className="px-4"
                >
                  다시 시도
                </Button>
              }
            >
              <PostList
                posts={posts}
                onEdit={(postId) => router.push(`/community/post/${postId}/edit`)}
                onDelete={requestDelete}
              />
            </ListState>
          </Container>
        </TabsContent>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </HomeTabs>

      {/* [refactored] 게시글 삭제 확인 — 공통 DeleteConfirmModal */}
      <DeleteConfirmModal target="게시글" {...deleteModalProps} />
    </div>
  )
}

export { MyHomeContent }
