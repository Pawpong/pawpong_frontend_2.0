import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import {
  mapCommunityPostDetail,
  type RawCommunityPostDetail,
} from '@/entities/community/api/community.api'
import type { CommunityPostDetail } from '@/shared/types'

/** A request-scoped anonymous snapshot. Native requests retain the API's content-rights filter. */
export const getPublicCommunityPost = cache(
  async (postId: string): Promise<CommunityPostDetail | null> => {
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!origin || !/^[a-f\d]{24}$/i.test(postId)) return null
    const native = /PawpongApp\//.test((await headers()).get('user-agent') ?? '')
    try {
      const response = await fetch(
        `${origin.replace(/\/+$/, '')}/api/v2/community/posts/${postId}`,
        {
          credentials: 'omit',
          cache: 'no-store',
          signal: AbortSignal.timeout(3000),
          ...(native ? { headers: { 'User-Agent': 'PawpongApp/iOS' } } : {}),
        },
      )
      if (!response.ok) return null
      const body = (await response.json()) as { success?: boolean; data?: RawCommunityPostDetail }
      const post = body.data
      if (!body.success || !post || post.visibility !== 'public' || post.status !== 'published')
        return null
      return mapCommunityPostDetail(post)
    } catch {
      return null
    }
  },
)
