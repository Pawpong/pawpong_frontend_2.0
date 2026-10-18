import type { Metadata } from 'next'
import { SHARE_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/config/site'
import { createMobileAppMetadata } from './mobileApp'

export const summarizeShareText = (value: string, limit = 160): string =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit)

export const createPageMetadata = ({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
  noIndex = false,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata => {
  const fullTitle =
    title === SITE_NAME ? `${SITE_NAME} | 새로운 가족과의 만남` : `${title} | ${SITE_NAME}`
  const summary = summarizeShareText(description) || SITE_DESCRIPTION
  const candidate = path && !noIndex ? new URL(path, SITE_URL) : undefined
  const url = candidate?.origin === SITE_URL ? candidate.href : undefined
  const imageUrl = image || SHARE_IMAGE
  return {
    title: fullTitle,
    description: summary,
    alternates: url ? { canonical: url } : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    ...(url && createMobileAppMetadata(url)),
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: SITE_NAME,
      title: fullTitle,
      description: summary,
      url,
      images: [{ url: imageUrl, alt: title, ...(!image && { width: 600, height: 315 }) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: summary,
      images: [imageUrl],
    },
  }
}
