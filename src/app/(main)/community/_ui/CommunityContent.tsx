'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Button,
  DeleteConfirmModal,
  Chip,
  InfiniteScrollTrigger,
  ListState,
  LoginPromptModal,
  NavigationBar,
  SearchBar,
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
import { flattenPages } from '@/shared/lib/infiniteList'
import { cn } from '@/shared/lib/cn'
import type { CommunityPetType, CommunitySortType } from '@/shared/types'
import { COMMUNITY_SORT_OPTIONS } from './constants'

const PET_OPTIONS = [
  { value: '', label: '전체 이야기', shortLabel: '전체' },
  { value: 'cat', label: '고양이 이야기', shortLabel: '고양이' },
  { value: 'dog', label: '강아지 이야기', shortLabel: '강아지' },
  { value: 'reptile', label: '파충류 이야기', shortLabel: '파충류' },
] as const

const CommunityContent = () => {
  const router = useRouter()
  const [petType, setPetType] = useState<CommunityPetType | ''>('')
  const [sort, setSort] = useState<CommunitySortType>('latest')
  const [appliedSearch, setAppliedSearch] = useState('')
  const { guard, isPromptOpen, setPromptOpen } = useLoginGuard()
  const { me } = useMe()
  const { requestDelete, modalProps: deleteModalProps } = useDeletePostConfirm()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(
      communityQueries.posts(sort, petType || undefined, undefined, appliedSearch || undefined),
    )
  const posts = flattenPages(data)
  const firstPhotoPostId = getFirstPhotoPostId(posts)
  const writePost = guard(() => router.push('/community/write'))
  const selectedLabel = PET_OPTIONS.find((option) => option.value === petType)?.label

  return (
    <>
      <NavigationBar
        title="커뮤니티"
        titleVariant="page"
        right={
          <div className="hidden tab:flex pc:hidden">
            <Button size="md" onClick={writePost}>
              <PlusIcon className="size-5" />
              글쓰기
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-[68rem] px-5 pt-5 pb-28 tab:px-8 tab:pt-8 pc:px-10">
        <div className="grid min-w-0 grid-cols-1 pc:grid-cols-[13rem_minmax(0,1fr)] pc:items-start pc:gap-12">
          <aside className="sticky top-24 hidden pc:block" aria-label="커뮤니티 탐색">
            <nav aria-label="동물별 이야기" className="flex flex-col gap-1">
              {PET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={petType === option.value}
                  onClick={() => setPetType(option.value)}
                  className={cn(
                    'flex min-h-12 items-center justify-between rounded-xl px-4 text-left text-[0.9375rem] focus-ring transition-colors',
                    petType === option.value
                      ? 'bg-neutral-100 font-semibold text-neutral-850'
                      : 'font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850',
                  )}
                >
                  {option.label}
                  {petType === option.value && (
                    <span aria-hidden className="size-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              ))}
            </nav>
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <Button onClick={writePost} width="full" size="lg">
                글쓰기
              </Button>
              <p className="mt-3 px-1 text-xs leading-relaxed text-neutral-500">
                작은 일상도, 궁금한 것도
                <br />
                편하게 나눠주세요.
              </p>
            </div>
          </aside>

          <section className="min-w-0" aria-label="커뮤니티 게시글">
            <SearchBar
              key={appliedSearch}
              className="mb-6"
              placeholder={{
                mobile: '궁금한 이야기 검색',
                desktop: '궁금한 이야기를 검색해보세요',
              }}
              defaultValue={appliedSearch}
              onSubmit={setAppliedSearch}
            />

            <nav
              aria-label="동물별 이야기"
              className="mb-6 flex gap-2 overflow-x-auto pb-1 pc:hidden"
            >
              {PET_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={petType === option.value}
                  onClick={() => setPetType(option.value)}
                >
                  {option.shortLabel}
                </Chip>
              ))}
            </nav>

            <div className="flex items-center justify-between gap-3 border-b border-neutral-150 pb-4">
              <h2 className="text-base font-semibold text-neutral-850">
                {appliedSearch ? '검색 결과' : selectedLabel}
              </h2>
              <div className="flex items-center gap-3" aria-label="게시글 정렬">
                {COMMUNITY_SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={sort === option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(
                      'min-h-10 rounded px-1 text-sm focus-ring',
                      sort === option.value
                        ? 'font-semibold text-neutral-850'
                        : 'text-neutral-500 hover:text-neutral-850',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {appliedSearch && (
              <div className="flex items-center justify-between gap-3 border-b border-neutral-100 py-3 text-sm">
                <p className="min-w-0 truncate text-neutral-700">“{appliedSearch}” 검색 결과</p>
                <Button intent="ghost" size="sm" onClick={() => setAppliedSearch('')}>
                  검색 해제
                </Button>
              </div>
            )}
            {isPending && (
              <div>
                {[0, 1, 2].map((i) => (
                  <CommunityFeedCardSkeleton key={i} wide />
                ))}
              </div>
            )}
            <ListState
              isPending={false}
              isError={isError}
              isEmpty={!isPending && posts.length === 0}
              loadingText="게시글을 불러오는 중입니다."
              errorText="이야기를 불러오지 못했어요."
              errorAction={
                <Button size="md" intent="secondary" onClick={() => void refetch()}>
                  다시 시도
                </Button>
              }
              emptyText={
                appliedSearch
                  ? '검색 결과가 없어요. 다른 검색어로 찾아보세요.'
                  : '아직 이야기가 없어요. 첫 이야기를 들려주세요.'
              }
            >
              <div>
                {posts.map((post) => {
                  const isMyPost = me?.userId === post.authorId
                  return (
                    <ConnectedFeedCard
                      wide
                      key={post.postId}
                      preload={post.postId === firstPhotoPostId}
                      guard={guard}
                      {...toCommunityPreviewProps(post)}
                      onEdit={
                        isMyPost
                          ? () => router.push(`/community/post/${post.postId}/edit`)
                          : undefined
                      }
                      onDelete={isMyPost ? () => requestDelete(post.postId) : undefined}
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

        <div className="fixed right-5 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-sticky flex rounded-lg shadow-md tab:hidden">
          <Button onClick={writePost} size="lg">
            <PlusIcon className="size-5" />
            글쓰기
          </Button>
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
