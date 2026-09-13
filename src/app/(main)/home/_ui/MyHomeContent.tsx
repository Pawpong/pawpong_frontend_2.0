'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BookmarkIcon } from '@/shared/assets'
import { Button, Container, InputUpload, NavigationBar } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { profileQueries } from '@/entities/profile'
import { communityQueries } from '@/entities/community'
// [refactored] 분양 페이지와 동일한 목록 블록 — 위젯으로 공유
import { MyPetPostingList } from '@/widgets/my-pet-postings'
import { toMyProfileCardProps } from '../_lib/toMyProfileCardProps'
import { ProfileCard } from './ProfileCard'
import { HomeTabs, TabsContent } from './HomeTabs'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { HomePostGrid } from './HomePostGrid'
import {
  MY_HOME_TABS,
  BREEDER_MY_HOME_TABS,
  MY_HOME_SIDE_LINKS,
  CARD_GRID,
  PHOTO_GRID,
} from './constants'

const HOME_LISTING_PAGE_SIZE = 16

const MyHomeContent = () => {
  // 마이홈 프로필 카드: /profile/me 로 내 프로필 조회 (role 에 따라 adopter/breeder 분기, 프로필 이미지 포함)
  const profileQuery = useQuery({
    ...profileQueries.me(),
    ...transientQueryRecoveryOptions,
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

  // [refactored] navbar 는 2단(tab+)에서 숨고 sticky 도 아니라 높이를 잴 이유가 없어졌다.
  // sticky 기준은 GNB 하나뿐이고, 그건 HomeTabs 가 스스로 읽는다.
  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // 프로필 조회 전에는 역할을 모르므로 선택값을 비워두고, 조회 후 역할별 기본 탭을 사용한다.
  // useState(defaultTab)로 바로 시드하면 최초 adopter 기본값('posts')이 브리더에게도 고정된다.
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const activeTab = tabs.find((tab) => tab.id === selectedTab)?.id ?? defaultTab
  const posts = myPostsData?.items ?? []
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
      {/* 스크롤 시 GNB 아래 고정(sticky) — tab+만. PC는 사이드바가 프로필/현재 위치를 이미 보여줘
          타이틀 바가 GNB의 '마이홈' 활성 표시와 겹쳐 위계가 흐트러지므로 숨긴다 */}
      <div className="bg-white tab:hidden">
        <NavigationBar
          title="마이홈"
          titleClassName="font-cafe24 text-lg text-neutral-850 tab:text-xl"
          className="px-4 tab:px-12"
          right={
            <Link
              href="/bookmarks"
              aria-label="저장목록"
              className="-m-2 flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <BookmarkIcon className="size-6 text-neutral-700" />
            </Link>
          }
        />
      </div>

      <HomeTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setSelectedTab}
        sidebar={<ProfileCard {...profileCardProps} layout="sidebar" />}
        sideLinks={MY_HOME_SIDE_LINKS}
      >
        {/* 분양 목록 탭 (브리더만) — 시안 3170-790275: 라벨+필터 -> 카드 그리드.
            '분양 페이지 바로가기' 배너 제거 — /adoption/my-listings 가 이 탭과 같은
            목록 위젯을 그대로 보여줘 따로 링크할 이유가 없다 */}
        {isBreeder && (
          <TabsContent value="listings" className="mt-0">
            <InputUpload text="분양글 작성하기" href="/adoption/create" className="px-4" />

            <Container className="py-5">
              <MyPetPostingList
                pageSize={HOME_LISTING_PAGE_SIZE}
                gridClassName={`${CARD_GRID} pc:gap-x-[1.375rem]`}
              />
            </Container>
          </TabsContent>
        )}

        {/* Figma 4145:721426 — 모바일·태블릿 3열, PC 4열의 정사각 미디어 그리드 */}
        <TabsContent value="posts" className="mt-0">
          <InputUpload text="작성하기" href="/community/write" className="px-4" />

          <HomePostGrid
            posts={posts}
            isPending={postsQuery.isPending}
            isError={postsQuery.isError}
            onRetry={() => void postsQuery.refetch()}
            loadingText="내가 쓴 글을 불러오는 중입니다."
            errorText="내가 쓴 글을 불러오지 못했습니다."
            emptyText="내가 쓴 글이 없습니다."
            gridClassName={PHOTO_GRID}
          />
        </TabsContent>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent gridClassName={CARD_GRID} />
        </TabsContent>
      </HomeTabs>
    </div>
  )
}

export { MyHomeContent }
