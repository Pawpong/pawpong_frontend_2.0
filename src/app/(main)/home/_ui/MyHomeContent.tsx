'use client'

import { MyHomeActivity } from '@/features/gamification'
import { activityConfigOptions } from '@/entities/gamification'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { RetryButton, buttonVariants, Container, NavigationBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { profileQueries } from '@/entities/profile'
import { AiPhotoArchive } from '@/features/ai-image'
// [refactored] 분양 페이지와 동일한 목록 블록 — 위젯으로 공유
import { MyPetPostingList } from '@/widgets/my-pet-postings'
import { toMyProfileCardProps } from '../_lib/toMyProfileCardProps'
import { ProfileCard } from './ProfileCard'
import { MyHomeActionMenu } from './MyHomeActionMenu'
import { BreederIntroduction } from './BreederIntroduction'
import { HomeTabs, TabsContent } from './HomeTabs'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'
import { MyPostsTab } from './MyPostsTab'
import {
  MY_HOME_TABS,
  BREEDER_MY_HOME_TABS,
  MY_HOME_SIDE_LINKS,
  BREEDER_MY_HOME_SIDE_LINKS,
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

  // [refactored] navbar 는 2단(tab+)에서 숨고 sticky 도 아니라 높이를 잴 이유가 없어졌다.
  // sticky 기준은 GNB 하나뿐이고, 그건 HomeTabs 가 스스로 읽는다.
  const activityConfig = useQuery(activityConfigOptions)
  const baseTabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const tabs =
    activityConfig.data?.enabled && !activityConfig.isError
      ? [...baseTabs, { id: 'activity', label: '나의 활동' }]
      : baseTabs
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // 프로필 조회 전에는 역할을 모르므로 선택값을 비워두고, 조회 후 역할별 기본 탭을 사용한다.
  // useState(defaultTab)로 바로 시드하면 최초 adopter 기본값('posts')이 브리더에게도 고정된다.
  // AI 필터 화면의 '보관함 →' 처럼 특정 탭으로 바로 들어오는 링크(?tab=ai-photos)를 받는다
  const requestedTab = useSearchParams().get('tab')
  const [selectedTab, setSelectedTab] = useState<string | null>(requestedTab)
  const activeTab = tabs.find((tab) => tab.id === selectedTab)?.id ?? defaultTab
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
              <RetryButton
                onRetry={() => void profileQuery.refetch()}
                isRetrying={profileQuery.isFetching}
              />
            </div>
          )}
        </Container>
      </div>
    )
  }

  const introProps = {
    nickname: profileCardProps.profile.nickname,
    description: myProfile?.longDescription,
    photos: myProfile?.representativePhotos,
    editHref: '/profile/edit',
  }

  return (
    <div className="flex w-full flex-col">
      {/* 스크롤 시 GNB 아래 고정(sticky) — tab+만. PC는 사이드바가 프로필/현재 위치를 이미 보여줘
          타이틀 바가 GNB의 '마이홈' 활성 표시와 겹쳐 위계가 흐트러지므로 숨긴다 */}
      <div className="bg-white tab:hidden">
        <NavigationBar
          title="마이홈"
          titleVariant="page"
          titleClassName="px-10"
          className="relative min-h-12 px-4 tab:px-12"
          right={
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <MyHomeActionMenu isBreeder={isBreeder} />
            </div>
          }
        />
      </div>

      <HomeTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setSelectedTab}
        sidebar={
          <>
            <ProfileCard
              {...profileCardProps}
              layout="sidebar"
              menu={<MyHomeActionMenu isBreeder={isBreeder} />}
            />
            {isBreeder && <BreederIntroduction {...introProps} placement="profile" />}
          </>
        }
        sideLinks={isBreeder ? BREEDER_MY_HOME_SIDE_LINKS : MY_HOME_SIDE_LINKS}
      >
        <TabsContent value="activity" className="mt-0">
          <MyHomeActivity userId={myProfile?.userId} />
        </TabsContent>
        {/* 분양 목록 탭 (브리더만) — 시안 3170-790275: 라벨+필터 -> 카드 그리드.
            standalone /adoption/my-listings 페이지는 이 탭과 완전히 중복이라 제거했다 —
            분양 페이지 진입점은 전부 이 탭(/home)으로 온다 */}
        {isBreeder && (
          <TabsContent value="listings" className="mt-0">
            <BreederIntroduction {...introProps} placement="tab" />

            {/* 작성 진입점은 + 메뉴(모바일 상단 바·2단 프로필 카드)가 맡는다 */}
            <Container className="py-8 tab:py-10">
              <MyPetPostingList
                pageSize={HOME_LISTING_PAGE_SIZE}
                showTotalCount
                emptyAction={
                  <Link
                    href="/adoption/create"
                    className={cn(buttonVariants({ size: 'md' }), 'hidden tab:inline-flex')}
                  >
                    첫 분양글 작성하기
                  </Link>
                }
              />
            </Container>
          </TabsContent>
        )}

        {/* Figma 4145:721426 — 모바일·태블릿 3열, PC 4열의 정사각 미디어 그리드 */}
        <TabsContent value="posts" className="mt-0">
          {/* 작성한 글 / 댓글 단 글 / 좋아요한 글 칩 전환 — 내 글 조회는 profile 로드 후 활성화 */}
          <MyPostsTab enabled={!!myProfile} gridClassName={PHOTO_GRID} />
        </TabsContent>

        <TabsContent value="ai-photos" className="mt-0">
          <div className="px-4 pt-4 tab:px-0">
            <AiPhotoArchive enabled={!!myProfile} />
          </div>
        </TabsContent>

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent gridClassName={CARD_GRID} />
        </TabsContent>
      </HomeTabs>
    </div>
  )
}

export { MyHomeContent }
