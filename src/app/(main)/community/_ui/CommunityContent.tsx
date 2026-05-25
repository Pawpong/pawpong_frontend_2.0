'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Breadcrumb,
  Container,
  InfiniteScrollTrigger,
  PageHeader,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { MOCK_COMMUNITY_CATEGORIES } from '@/shared/mocks/community'
import { useCommunityPosts } from '@/entities/community'
import type { CommunitySortType } from '@/shared/types'
import { COMMUNITY_SORT_OPTIONS } from './constants'
import { CategorySidebar } from './CategorySidebar'
import { CommunityPostCard } from './CommunityPostCard'

const CommunityContent = () => {
  const [sort, setSort] = useState<CommunitySortType>('latest')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunityPosts(
    sort,
    undefined,
    selectedCategory || undefined,
  )
  const posts = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex w-full flex-col">
      <PageHeader title="커뮤니티" backHref="/" />

      {/* 서브헤더: 설명 + 작성 버튼 */}
      <Separator className="bg-border-light" />
      <Container>
        <div className="flex items-center justify-between py-[0.6875rem] tab:py-4">
          {/* 모바일: 게시글을 작성해보세요 / PC: 아이를 자랑해보세요 */}
          <p className="text-sm leading-[1.375rem] font-medium text-text-primary tab:text-base">
            <span className="tab:hidden">게시글을 작성해보세요</span>
            <span className="hidden tab:inline">아이를 자랑해보세요</span>
          </p>
          <Link
            href="/community/write"
            className="flex h-8 w-[4.4375rem] items-center justify-center rounded-full bg-fill-muted text-sm font-semibold text-white tab:h-12 tab:w-auto tab:px-7 tab:text-base"
          >
            작성
          </Link>
        </div>
      </Container>
      <Separator className="bg-border-light" />

      {/* 모바일: 필터 버튼 / PC: Breadcrumb + Sort */}
      <Container>
        <div className="flex items-center justify-end py-3 tab:justify-between tab:pt-8 tab:pb-4">
          {/* PC only: Breadcrumb */}
          <Breadcrumb items={['홈', '커뮤니티']} />

          {/* 모바일: 필터 pill / PC: 정렬 드롭다운 */}
          <button
            type="button"
            className="rounded-full border border-text-muted px-2.5 py-1 text-sm leading-[1.375rem] font-semibold text-text-muted tab:hidden"
          >
            필터
          </button>
          <div className="hidden tab:block">
            <Select value={sort} onValueChange={(v) => setSort(v as CommunitySortType)}>
              <SelectTrigger className="w-auto gap-2.5 rounded-full border-text-muted px-2.5 py-1 text-sm font-semibold text-text-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNITY_SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Container>

      {/* Main: Sidebar + Feed */}
      <Container>
        <div className="flex gap-6 pb-10 tab:pb-16">
          {/* PC Category Sidebar */}
          <CategorySidebar
            categories={MOCK_COMMUNITY_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Post Feed */}
          <div className="min-w-0 flex-1">
            {/* 모바일: 구분선 분리 */}
            <div className="tab:hidden">
              {posts.map((post, index) => (
                <div key={post.postId}>
                  <CommunityPostCard post={post} />
                  {index < posts.length - 1 && <Separator fullWidth className="bg-border-light" />}
                </div>
              ))}
            </div>

            {/* PC: 카드 border */}
            <div className="hidden tab:flex tab:flex-col tab:gap-3">
              {posts.map((post) => (
                <div
                  key={post.postId}
                  className="overflow-hidden rounded-2xl border border-border-light px-[3.125rem]"
                >
                  <CommunityPostCard post={post} />
                </div>
              ))}
            </div>

            <InfiniteScrollTrigger
              onIntersect={fetchNextPage}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
            />
          </div>
        </div>
      </Container>
    </div>
  )
}

export { CommunityContent }
