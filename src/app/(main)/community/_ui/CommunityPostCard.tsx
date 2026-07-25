'use client'

import Image from 'next/image'
import { AuthorInfo, DetailLink, PostActionButton } from '@/shared/ui'
import { FavoriteIcon, ChatBubbleIcon } from '@/shared/assets/icons'
import type { CommunityPostCard as CommunityPostCardType } from '@/shared/types'

interface CommunityPostCardProps {
  post: CommunityPostCardType
}

const CommunityPostCard = ({ post }: CommunityPostCardProps) => {
  return (
    <article className="flex flex-col pt-[1.176rem] pb-[0.671rem] tab:py-8">
      {/* Author + Description */}
      <div className="flex flex-col">
        {/* Author Row */}
        <AuthorInfo
          authorId={post.authorId}
          nickname={post.authorNickname}
          profileImageUrl={post.authorProfileImageUrl}
          createdAt={post.createdAt}
        />

        {/* Description */}
        <div className="mt-1 flex items-center justify-between tab:mt-0 tab:pl-[3.0625rem]">
          <p className="text-sm font-bold text-text-secondary">{post.bodyExcerpt}</p>
          <DetailLink
            href={`/community/${post.postId}`}
            size="md"
            className="hidden shrink-0 text-text-secondary tab:inline-flex"
          />
        </div>
      </div>

      {/* Image Grid */}
      <div className="-mx-[1.25rem] mt-[1.097rem] flex gap-3 overflow-hidden pl-[1.25rem] tab:-mx-[3.125rem] tab:mt-[2.179rem] tab:pl-[3.125rem]">
        {post.photoUrls.map((url, index) => (
          <div
            key={index}
            className="relative h-[8.995rem] w-[14.6147rem] shrink-0 overflow-hidden rounded-[0.67rem] bg-fill-placeholder tab:aspect-[349/215] tab:h-auto tab:w-[21.8125rem] tab:rounded-2xl"
          >
            {url && (
              <Image src={url} alt={`게시글 이미지 ${index + 1}`} fill className="object-cover" />
            )}
          </div>
        ))}
      </div>

      {/* Actions: Like, Comment + Bookmark(PC only) */}
      <div className="mt-[0.763rem] flex items-center gap-[1.3125rem] tab:mt-[0.96rem]">
        <PostActionButton icon={FavoriteIcon} count={post.likeCount} />
        <PostActionButton icon={ChatBubbleIcon} count={post.commentCount} />
        <div className="hidden items-center tab:flex">
          <Image src="/bookmark.svg" alt="북마크" width={24} height={24} />
        </div>
      </div>
    </article>
  )
}

export { CommunityPostCard }
