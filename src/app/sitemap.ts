import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/about',
    '/explore',
    '/community',
    '/hall-of-fame',
    '/notices',
    '/faq',
    '/ai-filter',
    '/care-map',
    '/playground',
    '/terms-of-privacy',
    '/terms-of-service',
    '/account/delete',
  ].map((path) => ({ url: `${SITE_URL}${path}` }))
}
