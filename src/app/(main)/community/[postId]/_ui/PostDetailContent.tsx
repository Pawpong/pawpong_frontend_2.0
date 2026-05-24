'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage, Container, PageHeader, Separator } from '@/shared/ui'
import { FavoriteIcon, ChatBubbleIcon, MoreVertIcon } from '@/shared/assets/icons'
import {
  MOCK_COMMUNITY_POST_DETAIL,
  MOCK_COMMUNITY_CATEGORIES,
} from '@/shared/mocks/community'
import { CategorySidebar } from '../../_ui/CategorySidebar'
import { CommentItem } from './CommentItem'

const PostDetailContent = () => {
  // TODO: API 연동 후 useCommunityPostDetail(postId) 로 교체
  const post = MOCK_COMMUNITY_POST_DETAIL

  return (
    <div className="flex w-full flex-col">
      <PageHeader title="게시물" backHref="/community" />

      {/* Breadcrumb (PC only) */}
      <Container>
        <nav className="hidden pb-4 pt-8 text-sm font-medium leading-[1.375rem] tab:block">
          <span className="text-text-muted">{'홈 > '}</span>
          <span className="text-text-primary">커뮤니티</span>
        </nav>
      </Container>

      {/* Main: Sidebar + Detail */}
      <Container>
        <div className="flex gap-6 pb-10 tab:pb-16">
          {/* PC Category Sidebar */}
          <CategorySidebar
            categories={MOCK_COMMUNITY_CATEGORIES}
            selected=""
            onSelect={() => {}}
          />

          {/* Post Detail Card */}
          <div className="min-w-0 flex-1">
            <div className="tab:overflow-hidden tab:rounded-2xl tab:border tab:border-border-light">
              {/* Post Header */}
              <div className="px-0 pt-[1.176rem] tab:px-[3.125rem] tab:pt-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Link href={`/home/${post.authorId}`} className="flex items-center gap-3">
                      <Avatar size="sm">
                        {post.authorProfileImageUrl ? (
                          <AvatarImage src={post.authorProfileImageUrl} alt={post.authorNickname} />
                        ) : (
                          <AvatarFallback className="bg-fill-muted" />
                        )}
                      </Avatar>
                      <span className="text-sm font-bold text-text-primary">
                        {post.authorNickname}
                      </span>
                    </Link>
                    <span className="text-xs font-bold text-text-secondary">
                      {post.createdAt}
                    </span>
                  </div>
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
                {[
                  { Icon: FavoriteIcon, count: post.likeCount },
                  { Icon: ChatBubbleIcon, count: post.commentCount },
                ].map(({ Icon, count }) => (
                  <div key={Icon.name} className="flex items-center gap-1.5">
                    <Icon className="size-6 text-text-primary" />
                    <span className="text-sm font-semibold leading-[1.375rem] text-text-primary">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <Separator className="-mx-[1.25rem] mt-4 w-[calc(100%+2.5rem)] bg-border-light tab:mx-0 tab:w-full" />
              <div className="px-0 pb-4 tab:px-[3.125rem] tab:pb-8">
                {post.commentPreview.map((comment) => (
                  <CommentItem key={comment.commentId} comment={comment} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostDetailContent }
