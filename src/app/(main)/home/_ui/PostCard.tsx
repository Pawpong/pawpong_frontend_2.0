'use client'

import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage, DetailLink } from '@/shared/ui'
import { FavoriteIcon, MessageIcon } from '@/shared/assets/icons'
import type { MyHomePost } from '@/shared/mocks/myHome'

interface PostCardProps {
  post: MyHomePost
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="flex flex-col pb-[0.671rem] pt-[1.176rem] tab:py-8">
      {/* Author + Description */}
      <div className="flex flex-col">
        {/* Author Row */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="size-[2.3125rem]">
              {post.author.avatarUrl ? (
                <AvatarImage src={post.author.avatarUrl} alt={post.author.nickname} />
              ) : (
                <AvatarFallback className="bg-fill-muted" />
              )}
            </Avatar>
            <span className="text-sm font-bold text-text-primary">
              {post.author.nickname}
            </span>
          </div>
          <span className="text-xs font-bold text-text-secondary">
            {post.createdAt}
          </span>
        </div>

        {/* Description */}
        <div className="flex items-center justify-between pl-[3.0625rem]">
          <p className="text-sm font-bold text-text-secondary">
            {post.description}
          </p>
          <DetailLink href="#" size="md" className="hidden text-text-secondary tab:inline-flex" />
        </div>
      </div>

      {/* Image Grid */}
      <div className="-mx-[1.25rem] mt-[1.097rem] flex gap-3 overflow-hidden pl-[1.25rem] tab:-mx-[3.125rem] tab:mt-[2.179rem] tab:pl-[3.125rem]">
        {post.images.map((image, index) => (
          <div
            key={index}
            className="relative h-[8.995rem] w-[14.6147rem] shrink-0 overflow-hidden rounded-[0.67rem] bg-fill-placeholder tab:aspect-4/3 tab:h-auto tab:w-[22.55rem] tab:rounded-2xl"
          >
            {image && (
              <Image
                src={image}
                alt={`게시글 이미지 ${index + 1}`}
                fill
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Like & Comment */}
      <div className="mt-[0.763rem] flex items-center gap-[1.3125rem] tab:mt-[0.96rem]">
        {[
          { Icon: FavoriteIcon, count: post.likeCount },
          { Icon: MessageIcon, count: post.commentCount },
        ].map(({ Icon, count }) => (
          <div key={Icon.name} className="flex items-center gap-1.5">
            <Icon className="size-6 text-text-primary" />
            <span className="text-sm font-semibold leading-[1.375rem] text-text-primary">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { PostCard }
