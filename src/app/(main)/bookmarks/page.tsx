import { createPageMetadata } from '@/shared/lib/metadata'

import { BookmarksContent } from './_ui/BookmarksContent'

export const metadata = createPageMetadata({ title: '관심 목록', noIndex: true })

const BookmarksPage = async ({ searchParams }: { searchParams: Promise<{ tab?: string }> }) => {
  const { tab } = await searchParams
  return <BookmarksContent initialTab={typeof tab === 'string' ? tab : undefined} />
}

export default BookmarksPage
