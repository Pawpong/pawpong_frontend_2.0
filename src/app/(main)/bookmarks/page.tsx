import { createPageMetadata } from '@/shared/lib/metadata'

import { BookmarksContent } from './_ui/BookmarksContent'

export const metadata = createPageMetadata({ title: '관심 목록', noIndex: true })

const BookmarksPage = () => {
  return <BookmarksContent />
}

export default BookmarksPage
