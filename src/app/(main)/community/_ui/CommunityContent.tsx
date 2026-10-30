'use client'

import { useMemo } from 'react'
import { ActivityBadgeRow, BreederLevelBadge, toBreederLevel } from '@/entities/gamification'
import { useRouter, useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  communityExperienceConfigOptions,
  countCommunityDiscovery,
  parseCommunityFeedNavigation,
  communityFeedHref,
  communityWriteEntry,
  COMMUNITY_SEARCH_MAX_LENGTH,
  type CommunityExperienceConfig,
  type CommunityFeedNavigation,
} from '@/entities/community'
import {
  Button,
  DeleteConfirmModal,
  IconButton,
  InfiniteScrollTrigger,
  ListState,
  LoginPromptModal,
  NavigationBar,
  SearchBar,
  SortOptions,
} from '@/shared/ui'
import { PlusIcon } from '@/shared/assets'
import {
  COMMUNITY_LOGIN_PROMPT,
  CommunityFeedCardSkeleton,
  communityQueries,
  getFirstPhotoPostId,
  toCommunityPreviewProps,
} from '@/entities/community'
import { ConnectedFeedCard, useDeletePostConfirm } from '@/features/community'
import { useLoginGuard, useMe } from '@/features/auth'
import { FeedFollowButton } from './FeedFollowButton'
import { flattenPages } from '@/shared/lib/infiniteList'
import type { CommunityDiscoveryFilters } from '@/shared/types'
import { COMMUNITY_SORT_OPTIONS } from './constants'
import {
  AppliedFilters,
  CommunityCategoryNav,
  CommunityCategoryBand,
  CommunityDetailFilter,
  CommunityPetTiles,
  CommunitySideNav,
  CommunitySubTopics,
  discoveryTitle,
} from './CommunityDiscovery'
import { CommunityFeedMeta } from './CommunityFeedMeta'

// '전체'는 카테고리의 '전체'와 같은 격자 아이콘을 써서 뜻을 맞춘다
const PET_OPTIONS = [
  { value: '', label: '전체 이야기', shortLabel: '전체', icon: 'all' },
  { value: 'cat', label: '고양이 이야기', shortLabel: '고양이', icon: 'cat' },
  { value: 'dog', label: '강아지 이야기', shortLabel: '강아지', icon: 'dog' },
  { value: 'reptile', label: '파충류 이야기', shortLabel: '파충류', icon: 'reptile' },
] as const

const CommunityContent = ({
  initialExperience,
}: {
  /** 서버에서 미리 받은 확장 기능 설정 — 있으면 카테고리 줄을 첫 화면부터 그린다 */
  initialExperience?: { config: CommunityExperienceConfig; fetchedAt: number } | null
}) => {
  const router = useRouter()
  const parameters = useSearchParams()
  const query = parameters.toString()
  const navigation = useMemo(
    () => parseCommunityFeedNavigation(new URLSearchParams(query)),
    [query],
  )
  const { petType, sort, search: appliedSearch, discovery } = navigation
  const changeNavigation = (next: Partial<CommunityFeedNavigation>) => {
    router.replace(communityFeedHref({ ...navigation, ...next }), { scroll: false })
  }
  const setDiscovery = (next: CommunityDiscoveryFilters) => {
    changeNavigation({ discovery: next })
  }
  const experience = useQuery({
    ...communityExperienceConfigOptions,
    throwOnError: false,
    ...(initialExperience && {
      initialData: initialExperience.config,
      initialDataUpdatedAt: initialExperience.fetchedAt,
    }),
  })
  const experienceEnabled = experience.data?.enabled === true && !experience.isError
  const hasDiscovery = countCommunityDiscovery(discovery) > 0
  const filterUnavailable = hasDiscovery && experience.isError
  const filtered = experienceEnabled && hasDiscovery // [refactored] 같은 개수 계산을 두 번 하지 않는다
  const topicLabel = (key: string) =>
    experience.data?.topics.find((topic) => topic.key === key)?.label ?? key
  const { guard, isPromptOpen, setPromptOpen } = useLoginGuard()
  const { me } = useMe()
  const { requestDelete, modalProps: deleteModalProps } = useDeletePostConfirm()
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
    isFetching: isRetrying,
  } = useInfiniteQuery({
    ...communityQueries.posts(
      sort,
      petType || undefined,
      undefined,
      appliedSearch || undefined,
      15,
      undefined,
      filtered ? discovery : undefined,
    ),
    enabled: !hasDiscovery || (!experience.isPending && !experience.isError),
    throwOnError: false,
  })
  const posts = flattenPages(data)
  const firstPhotoPostId = getFirstPhotoPostId(posts)
  const writeEntry = communityWriteEntry(experienceEnabled ? discovery : {})
  const writePost = guard(() => {
    const entry = new URL(writeEntry.href, window.location.origin)
    entry.searchParams.set(
      'returnTo',
      communityFeedHref({ discovery, petType, sort, search: appliedSearch }),
    )
    router.push(`${entry.pathname}${entry.search}`)
  })
  // 하단 탭으로 오가는 최상위 화면이라 링크로 바로 열면 돌아갈 기록이 없다 — 그때는 홈으로 보낸다
  const goBack = () => (window.history.length > 1 ? router.back() : router.push('/'))
  const selectedLabel = PET_OPTIONS.find((option) => option.value === petType)?.label
  // 동물 · 카테고리 · 말머리를 목록 제목에 이어 지금 보는 범위를 한 줄로 알려 준다
  const listPath = appliedSearch
    ? ['검색 결과']
    : [selectedLabel, ...(experienceEnabled ? discoveryTitle(discovery, topicLabel) : [])].filter(
        (label): label is string => Boolean(label),
      )

  return (
    <>
      <NavigationBar
        title="커뮤니티"
        titleVariant="page"
        onBack={goBack}
        right={
          <>
            {/* PC 는 사이드바 글쓰기 버튼이 맡는다 */}
            <div className="flex pc:hidden">
              <IconButton tone="brand" aria-label="커뮤니티 글쓰기" onClick={writePost}>
                <PlusIcon aria-hidden className="size-7.5" />
              </IconButton>
            </div>
            {/* PC 에서 + 버튼이 빠진 자리를 뒤로가기 폭만큼 채워 제목을 가운데에 둔다 */}
            <div aria-hidden className="hidden size-6 pc:block" />
          </>
        }
      />
      <div className="page-shell pt-5 pb-28 tab:pt-8">
        <div className="grid min-w-0 grid-cols-1 pc:grid-cols-[13rem_minmax(0,1fr)] pc:items-start pc:gap-12">
          <aside className="sticky top-24 hidden pc:block" aria-label="커뮤니티 탐색">
            <p aria-hidden className="mb-2 px-4 text-xs font-semibold text-neutral-700">
              동물
            </p>
            <CommunitySideNav
              label="동물별 이야기"
              iconClassName="size-8" // [refactored] 동물 그림은 도트 아이콘보다 크게
              items={PET_OPTIONS.map((option) => ({
                key: option.value || 'all',
                label: option.label,
                icon: option.icon,
                selected: petType === option.value,
                onSelect: () => changeNavigation({ petType: option.value }),
              }))}
            />
            {experienceEnabled && (
              <>
                <p aria-hidden className="mt-6 mb-2 px-4 text-xs font-semibold text-neutral-700">
                  카테고리
                </p>
                <CommunityCategoryNav value={discovery} onChange={setDiscovery} />
              </>
            )}
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <Button onClick={writePost} width="full" size="lg">
                {writeEntry.label}
              </Button>
              <p className="mt-3 px-1 text-xs leading-relaxed text-neutral-700">
                작은 일상도, 궁금한 것도
                <br />
                편하게 나눠주세요.
              </p>
            </div>
          </aside>

          <section className="min-w-0" aria-label="커뮤니티 게시글">
            <SearchBar
              key={appliedSearch}
              className={experienceEnabled ? 'mb-4' : 'mb-6'}
              placeholder={{
                mobile: '궁금한 이야기 검색',
                desktop: '궁금한 이야기를 검색해보세요',
              }}
              defaultValue={appliedSearch}
              maxLength={COMMUNITY_SEARCH_MAX_LENGTH}
              onSubmit={(search) => changeNavigation({ search })}
            />
            {/* 동물 → 카테고리 → 말머리(배경이 연결된 세 줄). PC 는 동물·카테고리를 사이드바가 맡고 말머리 띠만 둔다 */}
            <CommunityPetTiles
              connected={experienceEnabled}
              options={PET_OPTIONS}
              value={petType}
              onChange={(next) => changeNavigation({ petType: next })}
            />
            {experienceEnabled && experience.data && (
              <>
                <CommunityCategoryBand
                  value={discovery}
                  onChange={setDiscovery}
                  topicLabel={topicLabel}
                />
                <CommunitySubTopics
                  value={discovery}
                  onChange={setDiscovery}
                  topicLabel={topicLabel}
                />
              </>
            )}
            {hasDiscovery && !experience.isPending && !experience.isError && !experienceEnabled && (
              <p
                role="status"
                className="mb-4 rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-700"
              >
                이 환경에서는 상세 필터를 사용할 수 없어 기본 이야기를 보여드려요.
                <button
                  type="button"
                  onClick={() => setDiscovery({})}
                  className="ml-2 min-h-8 font-semibold underline focus-ring"
                >
                  상세 조건 해제
                </button>
              </p>
            )}

            {/* 결과 도구 줄 — 지금 보는 범위(제목) 옆에 세부 조건과 정렬을 모은다 */}
            <div className="border-b border-neutral-150 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h2
                  aria-label={listPath.join(' > ')}
                  className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm font-medium text-neutral-700 tab:text-body-md"
                >
                  {listPath.map((label, index) => (
                    <span key={`${index}-${label}`} className="inline-flex items-center gap-1.5">
                      {index > 0 && (
                        <span aria-hidden="true" className="font-normal text-neutral-700">
                          {'>'}
                        </span>
                      )}
                      <span
                        className={
                          index === listPath.length - 1
                            ? 'font-semibold text-neutral-850'
                            : undefined
                        }
                      >
                        {label}
                      </span>
                    </span>
                  ))}
                </h2>
                <div className="flex shrink-0 items-center gap-3">
                  {experienceEnabled && experience.data && (
                    <CommunityDetailFilter
                      config={experience.data}
                      value={discovery}
                      onChange={setDiscovery}
                    />
                  )}
                  <SortOptions
                    ariaLabel="게시글 정렬"
                    options={COMMUNITY_SORT_OPTIONS}
                    value={sort}
                    onValueChange={(sort) => changeNavigation({ sort })}
                  />
                </div>
              </div>
              {experienceEnabled && experience.data && (
                <AppliedFilters
                  config={experience.data}
                  value={discovery}
                  onChange={setDiscovery}
                />
              )}
            </div>
            {appliedSearch && (
              <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-3 text-sm">
                <p className="min-w-0 truncate text-neutral-700">“{appliedSearch}” 검색 결과</p>
                <Button intent="ghost" size="sm" onClick={() => changeNavigation({ search: '' })}>
                  검색 해제
                </Button>
              </div>
            )}
            {isPending && !filterUnavailable && (
              <div>
                {[0, 1, 2].map((i) => (
                  <CommunityFeedCardSkeleton key={i} />
                ))}
              </div>
            )}
            <ListState
              appPublicContent={!appliedSearch && !filtered}
              isPending={false}
              isError={isError || filterUnavailable}
              isEmpty={filterUnavailable || (!isPending && posts.length === 0)}
              loadingText="게시글을 불러오는 중이에요."
              errorText={
                filterUnavailable
                  ? '탐색 조건을 확인하지 못했어요. 조건은 그대로 보관하고 있어요.'
                  : '이야기를 불러오지 못했어요.'
              }
              onRetry={() => (filterUnavailable ? void experience.refetch() : void refetch())}
              isRetrying={filterUnavailable ? experience.isFetching : isRetrying}
              emptyText={
                appliedSearch
                  ? '검색 결과가 없어요. 다른 검색어로 찾아보세요.'
                  : filtered
                    ? '조건에 맞는 이야기가 아직 없어요. 필터를 줄여 보세요.'
                    : '아직 이야기가 없어요. 첫 이야기를 들려주세요.'
              }
              emptyAction={
                <div className="flex flex-wrap justify-center gap-2">
                  {(appliedSearch || filtered || petType) && (
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => router.replace('/community', { scroll: false })}
                    >
                      전체 이야기 보기
                    </Button>
                  )}
                  <Button size="sm" onClick={writePost}>
                    {writeEntry.label}
                  </Button>
                </div>
              }
            >
              <div>
                {posts.map((post) => {
                  const isMyPost = me?.userId === post.authorId
                  return (
                    <ConnectedFeedCard
                      key={post.postId}
                      preload={post.postId === firstPhotoPostId}
                      guard={guard}
                      // 작성자 레벨·대표 배지는 글 목록 응답에 함께 실려 와 글과 같이 뜬다
                      nameLeading={
                        <BreederLevelBadge level={toBreederLevel(post.authorActivity?.level)} />
                      }
                      badgeSlot={<ActivityBadgeRow badges={post.authorActivity?.badges ?? []} />}
                      metaSlot={
                        experienceEnabled ? (
                          <CommunityFeedMeta
                            experience={post.experience}
                            topicLabel={topicLabel}
                            onFilter={setDiscovery}
                          />
                        ) : undefined
                      }
                      {...toCommunityPreviewProps(post)}
                      onEdit={
                        isMyPost
                          ? () => router.push(`/community/post/${post.postId}/edit`)
                          : undefined
                      }
                      onDelete={isMyPost ? () => requestDelete(post.postId) : undefined}
                      followAction={
                        <FeedFollowButton
                          userId={post.authorId}
                          isFollowing={post.isFollowingAuthor ?? false}
                          guard={guard}
                        />
                      }
                    />
                  )
                })}
              </div>
            </ListState>
            <InfiniteScrollTrigger
              onIntersect={fetchNextPage}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
            />
          </section>
        </div>

        <LoginPromptModal
          open={isPromptOpen}
          onOpenChange={setPromptOpen}
          description={COMMUNITY_LOGIN_PROMPT.reaction}
        />
        <DeleteConfirmModal target="게시글" {...deleteModalProps} />
      </div>
    </>
  )
}

export { CommunityContent }
