'use client'

import { Fragment, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  Container,
  InfiniteScrollTrigger,
  InputUpload,
  NavigationBar,
  SearchButton,
  Separator,
} from '@/shared/ui'
import { MOCK_COMMUNITY_POSTS } from '@/shared/mocks/community'
import { PostCard, communityQueries, toCommunityPreviewProps } from '@/entities/community'

const CommunityContent = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    ...communityQueries.posts('latest'),
    // ponytail: dev-api 다운 중 화면 확인용 — 에러 바운더리로 던지지 않고 목데이터로 렌더.
    // 서버 복구되면 이 옵션과 아래 MOCK_COMMUNITY_POSTS 폴백을 지운다.
    throwOnError: false,
  })
  const posts = data?.pages.flatMap((page) => page.items) ?? MOCK_COMMUNITY_POSTS

  // ponytail: 서버 검색 API 미구현 → 지금은 검색바 펼치기 UI만. keyword 파라미터 생기면 query 연결.
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="flex w-full flex-col">
      {/* 상단바 — 공통 NavigationBar (Figma 2063-213675 navigation bar) */}
      <NavigationBar title="포퐁커뮤니티" backHref="/" />

      {/* 작성 유도 바 — 공통 InputUpload (Figma 2063-213676, 상·하 보더 + px mo16/tab48/pc80) */}
      <InputUpload text="게시글을 올려보세요" href="/community/write" />

      {/* 검색 (Figma 1657-251460 — 버튼 클릭 시 focus 입력 pill로 전환)
          padding: mo 8·16 / tab 12·48 (px-4=모바일 16, tab48은 Container 기본값) */}
      <Container className="flex justify-end px-4 py-2 tab:py-3">
        <SearchButton
          active={searchOpen}
          value={query}
          onChange={setQuery}
          onClick={() => setSearchOpen(true)}
          // 비어 있을 때 포커스 잃으면 트리거로 복귀
          onBlur={() => query.trim() === '' && setSearchOpen(false)}
          // 모바일은 풀폭, tab+는 최대 300px
          className="max-w-none tab:max-w-[18.75rem]"
        />
      </Container>

      {/* Main: Feed — 모바일은 카드 나열(gap 20), tab+는 border 박스 하나에 구분선 (Figma 1054-34769)
          pc는 Figma(2063-215749) 기준 948px 고정 폭 가운데 정렬 */}
      <Container className="px-4 pb-10 tab:pb-16">
        <div className="mx-auto w-full pc:max-w-[59.25rem]">
          <div className="flex min-w-0 flex-col gap-5 tab:gap-8 tab:rounded-lg tab:border tab:border-neutral-300 tab:p-3">
            {posts.map((post, index) => (
              <Fragment key={post.postId}>
                {index > 0 && <Separator className="bg-border-light" />}
                <PostCard
                  {...toCommunityPreviewProps(post)}
                  // ponytail: 목록 API에 댓글 미리보기 없음 — 상세(commentPreview) 생기면 교체. 댓글 있는 글만.
                  commentPreview={
                    post.commentCount > 0
                      ? {
                          nickname: '댓글러',
                          body: '미리보기 댓글입니다. 한줄만 보여줍니다. 두줄이상 넘어가면 쩜쩜쩜 보여줍니다.',
                        }
                      : undefined
                  }
                />
              </Fragment>
            ))}
          </div>

          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
          />
        </div>
      </Container>
    </div>
  )
}

export { CommunityContent }
