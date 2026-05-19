'use client'

import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'
import { FavoriteIcon, MessageIcon } from '@/shared/assets/icons'
import type { MyHomePost } from '@/shared/mocks/myHome'

interface PostCardProps {
  post: MyHomePost
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="flex flex-col py-8">
      {/* Author + Description */}
      <div className="flex flex-col">
        {/* Author Row */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {post.author.avatarUrl ? (
                <AvatarImage src={post.author.avatarUrl} alt={post.author.nickname} />
              ) : (
                <AvatarFallback className="bg-[#d4d4d4]" />
              )}
            </Avatar>
            <span className="text-sm font-bold text-[#5d5d5d]">
              {post.author.nickname}
            </span>
          </div>
          <span className="text-xs font-bold text-[#959595]">
            {post.createdAt}
          </span>
        </div>

        {/* Description + 자세히 보기 */}
        <div className="mt-2 flex items-center justify-between pl-[3.0625rem]">
          <p className="text-sm font-bold text-[#959595]">
            {post.description}
          </p>
          <span className="shrink-0 text-sm font-semibold leading-[1.375rem] text-[#959595]">
            {`자세히 보기 >`}
          </span>
        </div>
      </div>

      {/* Image Grid */}
      <div className="-mx-[3.125rem] mt-[2.179rem] flex gap-3 overflow-hidden pl-[3.125rem]">
        {post.images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-4/3 w-[22.55rem] shrink-0 overflow-hidden rounded-2xl bg-[#c6c6c6]"
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
      <div className="mt-[0.96rem] flex items-center gap-[1.3125rem]">
        <div className="flex items-center gap-1.5">
          <FavoriteIcon className="size-6 text-[#5d5d5d]" />
          <span className="text-sm font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {post.likeCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageIcon className="size-6 text-[#5d5d5d]" />
          <span className="text-sm font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  )
}

export { PostCard }
