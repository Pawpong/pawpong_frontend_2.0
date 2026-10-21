import type { MetadataRoute } from 'next'
import { ALL_PLAY_CARDS } from '@/features/playground-tools/model/discovery'
import { playCardHref } from '@/features/playground-tools/model/playCardLinks'
import { collectPublicPostIds, searchIndexEnabled } from '@/shared/lib/searchIndex'
import { SITE_URL } from '@/shared/config/site'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!searchIndexEnabled(process.env.NEXT_PUBLIC_APP_ENV, process.env.VERCEL_ENV)) return []
  let posts: string[] = []
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL
  if (origin) {
    try {
      posts = await collectPublicPostIds(async (before) => {
        const url = new URL('/api/v2/community/public-index', origin)
        if (before) url.searchParams.set('before', before)
        const response = await fetch(url, {
          cache: 'no-store',
          credentials: 'omit',
          signal: AbortSignal.timeout(3000),
        })
        if (!response.ok) throw new Error('Public index unavailable')
        const body = await response.json()
        if (!body.success) throw new Error('Public index unavailable')
        return body.data
      })
    } catch {
      /* Static public pages remain discoverable during an API outage. */
    }
  }
  return [
    '/',
    '/about',
    '/app',
    '/explore',
    '/community',
    '/hall-of-fame',
    '/notices',
    '/faq',
    '/ai-filter',
    '/care-map',
    '/playground',
    '/playground/walk-card',
    '/playground/taste',
    '/playground/bti',
    '/playground/outing',
    '/playground/memory-card',
    '/playground/cards',
    ...ALL_PLAY_CARDS.map(playCardHref),
    ...posts.map((id) => `/community/post/${id}`),
    '/terms-of-privacy',
    '/terms-of-service',
    '/account/delete',
  ].map((path) => ({ url: `${SITE_URL}${path}` }))
}
