import type { MetadataRoute } from 'next'
import { searchIndexEnabled } from '@/shared/lib/searchIndex'
import { SITE_URL } from '@/shared/config/site'

export default function robots(): MetadataRoute.Robots {
  if (!searchIndexEnabled(process.env.NEXT_PUBLIC_APP_ENV, process.env.VERCEL_ENV))
    return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
