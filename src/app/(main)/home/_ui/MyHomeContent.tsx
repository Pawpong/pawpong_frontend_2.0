'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { RetryButton, buttonVariants, PageShell } from '@/shared/ui'
import { transientQueryRecoveryOptions } from '@/shared/api'
import { profileQueries } from '@/entities/profile'
import { activityConfigOptions } from '@/entities/gamification'
import { AiPhotoArchive } from '@/features/ai-image'
import { PetResultLink } from '@/features/playground-pet'
// [refactored] 분양 페이지와 동일한 목록 블록 — 위젯으로 공유
import { MyPetPostingList } from '@/widgets/my-pet-postings'
import { toMyProfileCardProps } from '../_lib/toMyProfileCardProps'
import { ProfileCard } from './ProfileCard'
import { BreederIntroduction } from './BreederIntroduction'
import { HomeTabs, TabsContent } from './HomeTabs'
import { MyPostsTab } from './MyPostsTab'
import { HomeSkeleton } from './HomeSkeleton'
import {
  MY_HOME_TABS,
  BREEDER_MY_HOME_TABS,
  MY_ACTIVITY_HREF,
  MY_HOME_SIDE_LINKS,
  BREEDER_MY_HOME_SIDE_LINKS,
  MY_HOME_TAB_PANEL,
  MY_HOME_LISTINGS_PANEL,
} from '../_lib/constants'

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
  // 활동 단계 기능이 꺼져 있으면 나의 활동 화면이 비므로 링크도 뺀다
  const activityConfig = useQuery(activityConfigOptions)
  const activityEnabled = !!activityConfig.data?.enabled && !activityConfig.isError
  const sideLinks = (isBreeder ? BREEDER_MY_HOME_SIDE_LINKS : MY_HOME_SIDE_LINKS).filter(
    (link) => activityEnabled || link.href !== MY_ACTIVITY_HREF,
  )

  // [refactored] navbar 는 2단(tab+)에서 숨고 sticky 도 아니라 높이를 잴 이유가 없어졌다.
  // sticky 기준은 GNB 하나뿐이고, 그건 HomeTabs 가 스스로 읽는다.
  const tabs = isBreeder ? BREEDER_MY_HOME_TABS : MY_HOME_TABS
  const defaultTab = isBreeder ? 'listings' : 'posts'
  // 프로필 조회 전에는 역할을 모르므로 선택값을 비워두고, 조회 후 역할별 기본 탭을 사용한다.
  // useState(defaultTab)로 바로 시드하면 최초 adopter 기본값('posts')이 브리더에게도 고정된다.
  // AI 필터 화면의 '보관함 →' 처럼 특정 탭으로 바로 들어오는 링크(?tab=ai-photos)를 받는다
  const requestedTab = useSearchParams().get('tab')
  const [selectedTab, setSelectedTab] = useState<string | null>(requestedTab)
  const activeTab = tabs.find((tab) => tab.value === selectedTab)?.value ?? defaultTab
  const profileCardProps = myProfile ? toMyProfileCardProps(myProfile) : null

  if (!profileCardProps) {
    return (
      <div className="flex w-full flex-col">
        {profileQuery.isPending ? (
          <HomeSkeleton />
        ) : (
          <PageShell className="flex min-h-60 items-center justify-center py-10">
            <div role="alert" className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-neutral-700">프로필을 불러오지 못했어요.</p>
              <RetryButton
                onRetry={() => void profileQuery.refetch()}
                isRetrying={profileQuery.isFetching}
              />
            </div>
          </PageShell>
        )}
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
      {/* 모바일은 로고 바 바로 아래 프로필부터 — '마이홈' 제목 줄과 작성 메뉴(+)는 두지 않는다 */}

      <HomeTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setSelectedTab}
        sidebar={
          <>
            <ProfileCard {...profileCardProps} layout="sidebar" />
            {isBreeder && <BreederIntroduction {...introProps} placement="profile" />}
          </>
        }
        sideLinks={sideLinks}
      >
        {/* 분양 목록 탭 (브리더만) — 시안 3170-790275: 라벨+필터 -> 카드 그리드.
            standalone /adoption/my-listings 페이지는 이 탭과 완전히 중복이라 제거했다 —
            분양 페이지 진입점은 전부 이 탭(/home)으로 온다 */}
        {isBreeder && (
          <TabsContent value="listings">
            <BreederIntroduction {...introProps} placement="tab" />

            {/* 새 분양글 작성은 '분양 목록 n건' 제목 줄의 + 가 맡는다 (모든 화면 폭) */}
            <PageShell className={MY_HOME_LISTINGS_PANEL}>
              <MyPetPostingList
                pageSize={HOME_LISTING_PAGE_SIZE}
                showTotalCount
                create={{ href: '/adoption/create', label: '새 분양글 등록' }}
                emptyAction={
                  <Link href="/adoption/create" className={buttonVariants({ size: 'md' })}>
                    첫 분양글 작성하기
                  </Link>
                }
              />
            </PageShell>
          </TabsContent>
        )}

        {/* 내가 쓴 글 — 입양자 공개 홈과 같은 1열 피드 카드 */}
        <TabsContent value="posts">
          {/* 작성한 글 / 댓글 단 글 / 좋아요한 글 / 저장한 글 칩 전환 — 내 글 조회는 profile 로드 후 활성화.
              분양 목록·AI 사진 탭과 같은 여백이라 제목 줄이 탭을 바꿔도 같은 자리에 온다 */}
          <PageShell className={MY_HOME_TAB_PANEL}>
            <MyPostsTab enabled={!!myProfile} />
          </PageShell>
        </TabsContent>

        <TabsContent value="ai-photos">
          {/* 분양 목록 탭과 같은 여백 — 제목 줄이 탭을 바꿔도 같은 자리에 온다 */}
          <PageShell className={MY_HOME_TAB_PANEL}>
            <AiPhotoArchive
              enabled={!!myProfile}
              createHref="/ai-filter"
              renderResultAction={(jobId) => <PetResultLink sourceJobId={jobId} />}
            />
          </PageShell>
        </TabsContent>
      </HomeTabs>
    </div>
  )
}

export { MyHomeContent }
