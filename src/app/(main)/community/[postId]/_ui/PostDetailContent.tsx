'use client'

import Image from 'next/image'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  AuthorInfo,
  Breadcrumb,
  Container,
  InfiniteScrollTrigger,
  PageHeader,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, ChatBubbleIcon, MoreVertIcon } from '@/shared/assets/icons'
import { MOCK_COMMUNITY_CATEGORIES } from '@/shared/mocks/community'
import { communityQueries } from '@/entities/community'
import { CategorySidebar } from '../../_ui/CategorySidebar'
import { PostActionButton } from '../../_ui/PostActionButton'
import { CommentItem } from './CommentItem'

interface PostDetailContentProps {
  postId: string
}

const PostDetailContent = ({ postId }: PostDetailContentProps) => {
  const { data: post } = useQuery(communityQueries.detail(postId))
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(communityQueries.comments(postId))
  const comments = commentsData?.pages.flatMap((page) => page.items) ?? []

  if (!post) return null

  return (
    <div className="flex w-full flex-col">
      <PageHeader title="게시물" backHref="/community" />

      {/* Breadcrumb (PC only) */}
      <Container>
        <Breadcrumb
          items={['홈', '커뮤니티']}
          className="hidden pt-8 pb-4 text-sm leading-[1.375rem] font-medium tab:block"
        />
      </Container>

      {/* Main: Sidebar + Detail */}
      <Container>
        <div className="flex gap-6 pb-10 tab:pb-16">
          {/* PC Category Sidebar */}
          <CategorySidebar categories={MOCK_COMMUNITY_CATEGORIES} selected="" onSelect={() => {}} />

          {/* Post Detail Card */}
          <div className="min-w-0 flex-1">
            <div className="tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
              {/* Post Header */}
              <div className="px-0 pt-[1.176rem] tab:px-[3.125rem] tab:pt-8">
                <div className="flex items-start justify-between">
                  <AuthorInfo
                    authorId={post.authorId}
                    nickname={post.authorNickname}
                    profileImageUrl={post.authorProfileImageUrl}
                    createdAt={post.createdAt}
                  />
                  <button type="button">
                    <MoreVertIcon className="size-6 text-text-primary" />
                  </button>
                </div>

                {/* Body */}
                <p className="mt-2 text-sm font-bold text-text-secondary tab:pl-[3.0625rem]">
                  {post.body}
                </p>
              </div>

              {/* Image Grid */}
              <div className="-mx-[1.25rem] mt-[1.097rem] flex gap-3 overflow-hidden pl-[1.25rem] tab:mx-0 tab:mt-[2.179rem] tab:pl-[3.125rem]">
                {post.photoUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative h-[8.995rem] w-[14.6147rem] shrink-0 overflow-hidden rounded-[0.67rem] bg-fill-placeholder tab:aspect-[349/215] tab:h-auto tab:w-[21.8125rem] tab:rounded-2xl"
                  >
                    {url && (
                      <Image
                        src={url}
                        alt={`게시글 이미지 ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-[0.763rem] flex items-center gap-[1.3125rem] px-0 tab:mt-[0.96rem] tab:px-[3.125rem]">
                <PostActionButton icon={FavoriteIcon} count={post.likeCount} />
                <PostActionButton icon={ChatBubbleIcon} count={post.commentCount} />
              </div>

              {/* Comments */}
              <Separator fullWidth className="mt-4 bg-border-light tab:mx-0 tab:w-full" />
              <div className="px-0 pb-4 tab:px-[3.125rem] tab:pb-8">
                {comments.map((comment) => (
                  <CommentItem key={comment.commentId} comment={comment} />
                ))}
                <InfiniteScrollTrigger
                  onIntersect={fetchNextPage}
                  hasNextPage={hasNextPage ?? false}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostDetailContent }
