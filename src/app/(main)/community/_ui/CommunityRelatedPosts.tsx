'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import type { CommunityPostCard } from '@/shared/types'

/**
 * 함께 읽을 글. 서버의 관련 글 선정을 먼저 쓰고,
 * 그 응답을 받지 못하면 같은 태그의 최신 글 목록으로 대신한다.
 */
export function CommunityRelatedPosts({
  postId,
  fallbackTag,
  moreHref,
}: {
  postId: string
  fallbackTag?: string
  /** 같은 주제·태그의 글 목록으로 가는 주소 */
  moreHref?: string
}) {
  const related = useQuery(communityQueries.related(postId))
  const byTag = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, undefined, 6, undefined, {
      tags: fallbackTag ? [fallbackTag] : [],
    }),
    enabled: related.isError && !!fallbackTag,
  })
  const posts: CommunityPostCard[] = related.isError
    ? (byTag.data?.pages.flatMap((page) => page.items) ?? [])
    : (related.data?.items ?? [])
  const items = posts.filter((post) => post.postId !== postId).slice(0, 4)
  if (!items.length) return null
  return (
    <aside aria-label="함께 읽을 글" className="rounded-xl border border-primary-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-cafe24 text-sm text-primary-700">함께 읽을 글</h3>
        {moreHref && (
          <Link
            href={moreHref}
            className="rounded text-xs font-semibold text-primary-700 underline focus-ring"
          >
            비슷한 글 더 보기
          </Link>
        )}
      </div>
      <ul className="mt-2 divide-y divide-neutral-100">
        {items.map((post) => (
          <li key={post.postId}>
            <Link
              href={`/community/post/${post.postId}`}
              className="flex min-h-14 items-center gap-3 rounded-lg py-2 focus-ring hover:bg-secondary-50"
            >
              {post.photoUrls[0] && (
                <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                  <Image
                    src={post.photoUrls[0]}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-snug font-medium text-neutral-850">
                  {post.title || post.bodyExcerpt}
                </span>
                <span className="mt-0.5 block truncate text-xs text-neutral-600">
                  {post.authorNickname}
                  {post.experience?.tags?.length
                    ? ` · ${post.experience.tags
                        .slice(0, 2)
                        .map((tag) => `#${tag}`)
                        .join(' ')}`
                    : ''}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
