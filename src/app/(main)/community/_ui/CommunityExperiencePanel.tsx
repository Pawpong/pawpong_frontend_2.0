'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  CommunityPixelIcon,
  CommunityRecordCard,
  communityExperienceConfigOptions,
  isCommunityPostHeld,
  summarizeCommunityRecords,
  toCommunityDiscoveryQuery,
} from '@/entities/community'
import { SharedRouteMap } from '@/features/care-map'
import { useCommunityAutoApplied } from '@/features/community'
import type { CommunityPostDetail } from '@/shared/types'
import { CommunityAnswer } from './CommunityAiAnswer'
import { CommunityRelatedPosts } from './CommunityRelatedPosts'

const CHIP =
  'inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold focus-ring transition-colors'

export function CommunityExperiencePanel({
  post,
  isOwner,
}: {
  post: CommunityPostDetail
  isOwner: boolean
}) {
  const config = useQuery(communityExperienceConfigOptions)
  const autoApplied = useCommunityAutoApplied(post.postId, isOwner)
  const active = config.data?.enabled === true && !config.isError
  if (!active) return null
  const experience = post.experience
  const held = isCommunityPostHeld(post)
  const topics = experience?.topics ?? []
  const tags = experience?.tags ?? []
  const records = summarizeCommunityRecords(experience)
  const route = experience?.route ?? []
  const label = (key: string) =>
    config.data?.topics.find((topic) => topic.key === key)?.label ?? key
  const auto = {
    topics: (autoApplied?.topics ?? []).filter((topic) => topics.includes(topic)),
    tags: (autoApplied?.tags ?? []).filter((tag) => tags.includes(tag)),
  }
  const autoCount = auto.topics.length + auto.tags.length
  const published = post.status === 'published' && !held
  const moreQuery = toCommunityDiscoveryQuery(
    tags.length ? { tags: [tags[0]] } : topics.length ? { topics: [topics[0]] } : {},
  )
  const empty = !topics.length && !tags.length && !records.length && !route.length
  if (empty && !published && !experience?.question) return null

  return (
    <section
      className="space-y-4 border-b border-neutral-100 bg-secondary-50/60 p-4"
      aria-label="이야기 정보"
    >
      {(topics.length > 0 || tags.length > 0) && (
        <div className="space-y-2">
          <ul className="flex flex-wrap gap-2" aria-label="주제와 태그">
            {topics.map((topic) => (
              <li key={`topic-${topic}`}>
                <Link
                  href={`/community?${toCommunityDiscoveryQuery({ topics: [topic] })}`}
                  className={`${CHIP} border-primary-300 bg-white text-primary-700 hover:bg-primary-50`}
                >
                  {label(topic)}
                </Link>
              </li>
            ))}
            {tags.map((tag) => (
              <li key={`tag-${tag}`}>
                <Link
                  href={`/community?${toCommunityDiscoveryQuery({ tags: [tag] })}`}
                  className={`${CHIP} border-secondary-400 bg-secondary-100 text-primary-700 hover:bg-secondary-200`}
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
          {isOwner && autoCount > 0 && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-neutral-700">
              <CommunityPixelIcon name="tag" className="text-secondary-600" />
              <span>
                포퐁 AI가 자동으로 붙였어요:{' '}
                <strong className="font-bold text-primary-700">
                  {[...auto.topics.map(label), ...auto.tags.map((tag) => `#${tag}`)].join(', ')}
                </strong>
              </span>
              <Link
                href={`/community/post/${post.postId}/edit`}
                className="rounded font-bold text-primary-700 underline focus-ring"
              >
                빼거나 바꾸기
              </Link>
            </p>
          )}
        </div>
      )}

      {records.map((summary) => (
        <CommunityRecordCard key={summary.kind} summary={summary} />
      ))}
      {experience?.clinic && (
        <p className="text-xs leading-relaxed text-neutral-600">
          작성자가 겪은 방문 경험이에요. 병원 평가나 의학적 판단이 아니에요.
        </p>
      )}

      {route.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-cafe24 text-sm text-primary-700">
            <CommunityPixelIcon name="travel" className="text-primary-500" />
            {experience?.walk ? '함께 걸은 산책 코스' : '다녀온 장소'}
          </h3>
          <SharedRouteMap points={route} />
          <ol className="space-y-2 text-sm text-neutral-850">
            {route.map((point, index) => (
              <li
                key={index}
                className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-3"
              >
                {point.photoIndex !== undefined && post.photoUrls[point.photoIndex] && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={post.photoUrls[point.photoIndex]}
                      alt={`${point.name}에서 공유한 사진`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-primary-500">{index + 1}번째 장소</span>
                  <p className="font-semibold break-words">{point.name}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-xs leading-relaxed text-neutral-600">
            작성자가 고른 장소를 순서대로 이은 지도예요. 실제 길 안내는 아니에요.
          </p>
        </div>
      )}

      {experience?.question && !held && (
        <p className="text-sm font-semibold text-neutral-850">
          비슷한 경험이 있다면 댓글로 나눠 주세요.
        </p>
      )}
      {experience?.question && config.data?.aiEnabled && !held && (
        <CommunityAnswer post={post} isOwner={isOwner} notice={config.data.aiNotice} />
      )}

      {published && (
        <CommunityRelatedPosts
          postId={post.postId}
          fallbackTag={post.visibility === 'public' ? tags[0] : undefined}
          moreHref={moreQuery ? `/community?${moreQuery}` : undefined}
        />
      )}
      {published && post.isSaved && (
        <p className="text-xs text-neutral-700">
          저장한 글이에요.{' '}
          <Link
            href="/bookmarks?tab=saved-feeds"
            className="rounded font-bold text-primary-700 underline focus-ring"
          >
            관심 목록에서 다시 보기
          </Link>
        </p>
      )}
    </section>
  )
}
